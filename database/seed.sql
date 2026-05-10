-- ============================================================
-- SEED: movie_recommender
-- ============================================================

USE movie_recommender;

-- Admin padrão (password: admin123)
INSERT INTO users (name, email, password_hash, role, onboarded, preferred_language, theme)
VALUES (
    'Administrador',
    'admin@movierecommender.ao',
    '$2y$12$LJ3m4qs3Grl0BP.grEhc4eIYvJpMBWjGaOuQg2fVzGqGr1K7aNGSi',
    'admin',
    1,
    'pt',
    'dark'
);

-- Utilizador teste (password: user123)
INSERT INTO users (name, email, password_hash, role, onboarded, preferred_language, theme)
VALUES (
    'Utilizador Teste',
    'user@movierecommender.ao',
    '$2y$12$LJ3m4qs3Grl0BP.grEhc4eIYvJpMBWjGaOuQg2fVzGqGr1K7aNGSi',
    'user',
    0,
    'pt',
    'dark'
);
