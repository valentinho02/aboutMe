#!/usr/bin/env python3
"""Fetch every public Velog post. No packages or API key required."""
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
posts, seen, cursor = [], set(), None
while True:
    query = 'query($cursor: ID) { posts(username: "valentinho", limit: 100, cursor: $cursor) { id title url_slug released_at tags } }'
    req = Request('https://v2.velog.io/graphql', data=json.dumps({'query': query, 'variables': {'cursor': cursor}}).encode(), headers={'Content-Type': 'application/json', 'User-Agent': 'INHO-Portfolio/1.0'})
    with urlopen(req, timeout=30) as response:
        result = json.load(response)
    if result.get('errors'):
        raise RuntimeError(result['errors'])
    batch = result['data']['posts']
    if not batch:
        break
    fresh = [p for p in batch if p['id'] not in seen]
    if not fresh:
        raise RuntimeError('Pagination did not advance; existing file was preserved.')
    for p in fresh:
        seen.add(p['id'])
        posts.append({'id': p['id'], 'title': p['title'], 'tags': p['tags'], 'date': p['released_at'][:10], 'url': 'https://velog.io/@valentinho/' + quote(p['url_slug'], safe='')})
    cursor = batch[-1]['id']
if not posts:
    raise RuntimeError('No posts returned; existing file was preserved.')
path = ROOT / 'data/posts.json'
temp = path.with_suffix('.tmp')
temp.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
temp.replace(path)
print(f'Updated {len(posts)} Velog posts → data/posts.json')
