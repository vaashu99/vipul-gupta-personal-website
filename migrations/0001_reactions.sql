-- Anonymous reactions: one current reaction per published article and visitor cookie.
-- No visitor IP addresses, names or email addresses are retained.
CREATE TABLE IF NOT EXISTS article_reactions (
  article TEXT NOT NULL CHECK(length(article) BETWEEN 6 AND 200),
  visitor_id TEXT NOT NULL CHECK(length(visitor_id) = 36),
  reaction TEXT NOT NULL CHECK(reaction IN ('like', 'helpful', 'insightful')),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (article, visitor_id)
);
