<?php
/**
 * ExportController — CSV and PDF export
 */
class ExportController
{
    public function export(Request $request): void
    {
        $user   = $request->getParam('__user');
        $type   = $request->getParam('type');
        $format = $request->getQueryParam('format', 'csv');

        switch ($type) {
            case 'watchlist': $data = (new WatchlistModel())->findByUser($user['id']); break;
            case 'favorites': $data = (new FavoriteModel())->findByUser($user['id']); break;
            case 'history':   $data = (new WatchedModel())->findByUser($user['id']); break;
            case 'ratings':   $data = (new RatingModel())->findByUser($user['id']); break;
            default:          $data = [];
        }

        if (empty($data)) Response::error('Sem dados para exportar');

        // Clean data for export
        $data = array_map(function ($row) {
            unset($row['id'], $row['user_id'], $row['poster_path']);
            return $row;
        }, $data);

        // Log export
        $db = Database::getInstance();
        $db->prepare('INSERT INTO export_logs (user_id, report_type, format) VALUES (?, ?, ?)')->execute([$user['id'], $type, $format]);

        if ($format === 'csv') {
            $output = fopen('php://temp', 'r+');
            fputcsv($output, array_keys($data[0]));
            foreach ($data as $row) fputcsv($output, $row);
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);
            Response::file($csv, "{$type}_" . date('Y-m-d') . '.csv', 'text/csv; charset=utf-8');
        } else {
            $html = '<html><head><meta charset="utf-8"><style>body{font-family:Arial;font-size:12px;margin:20px}h1{color:#E50914}table{width:100%;border-collapse:collapse;margin-top:15px}th{background:#1a1a2e;color:#fff;padding:8px;text-align:left}td{padding:6px;border-bottom:1px solid #ddd}</style></head><body>';
            $html .= '<h1>' . ucfirst($type) . '</h1><p>' . date('d/m/Y') . '</p><table><tr>';
            foreach (array_keys($data[0]) as $h) $html .= '<th>' . htmlspecialchars($h) . '</th>';
            $html .= '</tr>';
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $v) $html .= '<td>' . htmlspecialchars((string)$v) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</table></body></html>';
            Response::file($html, "{$type}_" . date('Y-m-d') . '.html', 'text/html; charset=utf-8');
        }
    }
}
