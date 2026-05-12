<?php
/**
 * AiController - Integrates with Groq for intelligent movie matchmaking
 *
 * Improvements (v2):
 * - Conversational, friendly assistant (multilingual)
 * - Uses llama-3.3-70b-versatile (much better reasoning than 8b)
 * - JSON object output guaranteed via response_format
 * - Generic chat fallback when user is just chatting
 * - Best-match TMDB lookup with year + original title to surface the exact film
 */
class AiController
{
    private TmdbApiService $tmdb;

    /** Map of app language codes to TMDB language codes */
    private static array $langMap = [
        'pt' => 'pt-PT',
        'en' => 'en-US',
        'de' => 'de-DE',
        'ru' => 'ru-RU',
        'it' => 'it-IT',
        'ko' => 'ko-KR',
        'fr' => 'fr-FR',
    ];

    public function __construct()
    {
        $this->tmdb = new TmdbApiService();
    }

    public function match(Request $request): void
    {
        $body = $request->getBody();
        $prompt = trim($body['prompt'] ?? '');
        $history = $body['history'] ?? []; // optional conversation history

        if (empty($prompt)) {
            Response::error('A prompt de pesquisa é obrigatória.', 400);
        }

        $groqApiKey = Env::get('GROQ_API_KEY');
        if (empty($groqApiKey) || $groqApiKey === 'your_groq_api_key_here') {
            Response::error('GROQ_API_KEY não está configurada no backend.', 500);
        }

        // Determine the user-facing language for replies + TMDB localisation
        $appLang = $request->getQueryParam('lang') ?? 'pt';
        $appLang = preg_replace('/[^a-z]/', '', strtolower($appLang)) ?: 'pt';
        $tmdbLang = self::$langMap[$appLang] ?? 'pt-PT';

        $languageInstruction = $this->getLanguageInstruction($appLang);

        $systemPrompt = <<<SYS
You are SULO, a passionate and friendly cinema expert who chats with the user like a real movie-loving friend.
Your job is to recommend movies (and series when relevant) that match EXACTLY what the user asks for.

Behaviour rules:
- Always reply in {$languageInstruction}.
- Be warm, conversational, never robotic. Acknowledge the user's mood / context.
- If the user asks for SPECIFIC TITLES (e.g. "show me Inception and Interstellar"), return those exact titles.
- If the user describes a vibe / genre / actor / decade, suggest 3 to 6 films/series that match VERY closely.
- Try hard to be accurate: real titles, real release years, no hallucinated movies.
- If the request is too vague, ask ONE short follow-up question via "reply" and leave "movies" empty.
- If the user is just chatting (greeting, thanks, small talk), respond friendly via "reply" and leave "movies" empty.

Output (STRICT JSON, no markdown fences):
{
  "reply": "<a friendly conversational sentence introducing the picks or asking a follow-up>",
  "movies": [
    { "title": "<ORIGINAL ENGLISH title for TMDB lookup>",
      "year":  "<4 digit release year as string, best guess if unsure>",
      "media_type": "movie" or "tv",
      "reason": "<one short sentence in the user's language explaining why this fits>"
    }
  ]
}

Recommend up to 6 entries. Prefer well-known, available titles. Never wrap the JSON in code fences.
SYS;

        $messages = [["role" => "system", "content" => $systemPrompt]];

        if (is_array($history)) {
            foreach (array_slice($history, -10) as $h) {
                if (!isset($h['role'], $h['content'])) continue;
                if (!in_array($h['role'], ['user', 'assistant'])) continue;
                $messages[] = ['role' => $h['role'], 'content' => (string) $h['content']];
            }
        }

        $messages[] = ["role" => "user", "content" => $prompt];

        $payload = [
            'model'           => 'llama-3.3-70b-versatile',
            'messages'        => $messages,
            'temperature'     => 0.6,
            'max_tokens'      => 1200,
            'response_format' => ['type' => 'json_object'],
        ];

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_TIMEOUT => 35,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $groqApiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0
        ]);

        $response = curl_exec($ch);
        $err      = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($err) {
            Response::error('Erro ao conectar ao Groq AI: ' . $err, 502);
        }

        if ($httpCode >= 400) {
            $decoded = json_decode($response, true);
            $msg = $decoded['error']['message'] ?? "HTTP $httpCode";

            // Fallback to a smaller model if 70b refuses or rate-limits
            if (strpos($msg, 'model') !== false || $httpCode === 429) {
                $payload['model'] = 'llama-3.1-8b-instant';
                $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_TIMEOUT => 35,
                    CURLOPT_POSTFIELDS => json_encode($payload),
                    CURLOPT_HTTPHEADER => [
                        'Authorization: Bearer ' . $groqApiKey,
                        'Content-Type: application/json'
                    ],
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => 0
                ]);
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
            }
        }

        $data = json_decode($response, true);
        if (!isset($data['choices'][0]['message']['content'])) {
            Response::error('Resposta inválida da IA.', 500);
        }

        $aiResponseText = $data['choices'][0]['message']['content'];
        $aiResponseText = preg_replace('/```json\s*(.*?)\s*```/s', '$1', $aiResponseText);
        $aiResponseText = preg_replace('/```\s*(.*?)\s*```/s', '$1', $aiResponseText);

        $parsed = json_decode($aiResponseText, true);

        // If JSON parsing failed, treat as chat reply
        if (!is_array($parsed)) {
            Response::success([
                'reply'           => trim($aiResponseText),
                'recommendations' => [],
            ]);
        }

        $reply       = is_string($parsed['reply'] ?? null) ? $parsed['reply'] : '';
        $suggestions = is_array($parsed['movies'] ?? null) ? $parsed['movies'] : [];

        $finalMovies = [];
        foreach ($suggestions as $sug) {
            $title = trim((string) ($sug['title'] ?? ''));
            if ($title === '') continue;

            $year      = isset($sug['year']) ? (string) $sug['year'] : null;
            $mediaType = ($sug['media_type'] ?? 'movie') === 'tv' ? 'tv' : 'movie';
            $reason    = (string) ($sug['reason'] ?? '');

            $best = $this->findBestMatch($title, $year, $mediaType, $tmdbLang);
            if ($best === null) continue;

            $best['ai_reason']  = $reason;
            $best['media_type'] = $mediaType;
            $finalMovies[] = $best;
        }

        Response::success([
            'reply'           => $reply,
            'recommendations' => $finalMovies,
        ]);
    }

    /**
     * Find the best TMDB entry for the given title+year, scoring against original title and release year
     */
    private function findBestMatch(string $title, ?string $year, string $mediaType, string $tmdbLang): ?array
    {
        // Search in English first (titles supplied are English originals), then in user lang if needed
        $candidates = [];

        // 1) Search English original
        $en = $this->tmdb->search($title, 1, 'en-US', $year);
        foreach (($en['results'] ?? []) as $r) $candidates[] = $r;

        // 2) Search localized
        if ($tmdbLang !== 'en-US') {
            $loc = $this->tmdb->search($title, 1, $tmdbLang, $year);
            foreach (($loc['results'] ?? []) as $r) $candidates[] = $r;
        }

        if (empty($candidates)) return null;

        $normTarget = $this->normalize($title);
        $bestScore  = -1;
        $best       = null;

        foreach ($candidates as $c) {
            $t1 = $this->normalize($c['title'] ?? '');
            $t2 = $this->normalize($c['original_title'] ?? '');

            $score = 0;
            if ($t1 === $normTarget || $t2 === $normTarget) $score += 100;
            elseif (str_starts_with($t1, $normTarget) || str_starts_with($t2, $normTarget)) $score += 60;
            elseif (str_contains($t1, $normTarget) || str_contains($t2, $normTarget)) $score += 30;

            $score += min(20, (float) ($c['popularity'] ?? 0) / 5);

            if ($year && !empty($c['release_date'])) {
                if (substr($c['release_date'], 0, 4) === $year) $score += 40;
                elseif (abs((int) substr($c['release_date'], 0, 4) - (int) $year) <= 1) $score += 15;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $c;
            }
        }

        return $best;
    }

    private function normalize(string $s): string
    {
        $s = mb_strtolower($s, 'UTF-8');
        $s = preg_replace('/[^\p{L}\p{N}\s]/u', '', $s);
        $s = preg_replace('/\s+/', ' ', $s);
        return trim($s);
    }

    private function getLanguageInstruction(string $appLang): string
    {
        return match ($appLang) {
            'en' => 'English',
            'de' => 'German (Deutsch)',
            'fr' => 'French (Français)',
            'it' => 'Italian (Italiano)',
            'ru' => 'Russian (Русский)',
            'ko' => 'Korean (한국어)',
            default => 'European Portuguese (Português de Portugal)',
        };
    }
}
