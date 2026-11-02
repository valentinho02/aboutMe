# INHO / aboutMe

CUDA, Triton, PyTorch 학습과 프로젝트를 소개하는 반응형 포트폴리오입니다.
설치할 라이브러리 없이 Python 3만 있으면 로컬 실행이 가능합니다.

## 로컬 실행

```sh
cd ~/aboutMe
python3 -m http.server 3000 --bind 127.0.0.1
```

브라우저에서 http://localhost:3000 을 열어주세요. 종료는 터미널에서 Ctrl+C.
파일을 수정한 뒤 브라우저를 새로고침하면 반영됩니다.

## 새 Velog 글 반영

```sh
cd ~/aboutMe
python3 scripts/sync_posts.py
```

모든 공개 글을 페이지 단위로 수집해 제목·원문 링크·태그·날짜를 갱신합니다.
RSS의 최신 20편 제한을 피하기 위해 Velog 공개 GraphQL을 사용합니다.
외부 API 변경이나 연결 실패 시 기존 목록은 유지되며 오류가 표시됩니다.
브라우저에서 직접 Velog에 요청하지 않으므로 CORS 또는 인증키가 필요 없습니다.
자동 주기 실행은 설정하지 않았습니다.

직접 추가할 때는 `data/posts.json`에 아래 형태의 항목을 넣으면 됩니다.
`id`는 겹치지 않게 정하고 날짜는 YYYY-MM-DD를 사용합니다.

```json
{"id":"my-post-001","title":"새 글 제목","url":"https://velog.io/@valentinho/글주소","date":"2026-11-02","tags":["CUDA"]}
```

## 내용 수정

- 자기소개·관심 분야: `index.html`
- 대표 프로젝트와 분류 기준: `app.js`
- 색상·레이아웃: `style.css`
- 글 목록: `data/posts.json`

현재 소개 문구는 공개 GitHub와 Velog를 바탕으로 작성한 초안입니다.
직무 목표·학력·연락처·개인 경력은 확인되지 않아 추가하지 않았습니다.
다크 모드는 브라우저에 선택을 저장하고, 검색창은 `/` 키로 이동할 수 있습니다.
글 제목을 누르면 새 탭에서 실제 Velog 글이 열립니다.
외부 웹폰트가 로드되지 않아도 기본 글꼴로 작동합니다.

## 디자인 참고

- https://brittanychiang.com — 소개·프로젝트·글로 이어지는 구성
- https://leerob.com — 간결한 소개와 글 중심의 탐색

디자인과 코드는 새로 구성했습니다. 서버·로그인·AWS 배포는 포함하지 않습니다.
