# Atlas Build Notes

## Pipeline

Loader
↓
Parser
↓
Normalizer
↓
Validator
↓
Resolver
↓
Builder

Builder produces:

- search.json
- graph.json
- navigation.json
- recommendations.json
- statistics.json
- rss.xml
- sitemap.xml

Future:

- HTML pages
- Static assets
- Incremental builds
- Plugin system
