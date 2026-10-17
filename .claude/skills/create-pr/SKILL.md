---
name: create-pr
description: 브랜치의 PR을 레포 템플릿에 맞춰 작성하고, 확인받은 뒤 gh로 생성한다. "PR 만들어줘", "PR 올려줘", "PR 본문 써줘" 등을 말할 때 사용.
argument-hint: "[base 브랜치]"
---

# create-pr

`.github/pull_request_template.md`를 채워 PR을 만든다. 초안을 보여주고 확인받기 전에는 PR을 만들지 않는다.

인자: `$ARGUMENTS`

- 인자는 base 브랜치다. 없으면 `main`을 쓴다.
- head 브랜치는 현재 브랜치다.

## 규칙

- `git push`는 사용자 확인 없이 실행하지 않는다.
- 실제로 확인하지 않은 내용은 쓰지 않는다. 돌리지 않은 검증은 체크하지 않는다.

## 1. 사전 확인

```bash
git branch --show-current
git status -sb
git fetch origin
git rev-parse --verify origin/<base>
gh pr list --head <head> --state open
```

- head가 이상하면 멈추고 어떤 브랜치로 할지 묻는다. 예: detached HEAD라 브랜치 이름이 없을 때, head가 base와 같을 때, head가 `main`일 때.
- base가 원격에 없으면 멈추고 알린다.
- head가 원격에 없거나 로컬이 원격보다 앞서 있으면(`ahead`) push해도 되는지 묻는다. 확인받으면 push하고 이어서 진행한다.
- 커밋하지 않은 변경이 있으면 PR에 포함되지 않는다고 알린다.
- 이미 열린 PR이 있으면 새로 만들지 않고 본문 수정 여부를 묻는다.
- `gh`가 로그인돼 있지 않으면 사용자에게 `! gh auth login`을 요청한다.

## 2. 변경 파악

```bash
git log --oneline origin/<base>..origin/<head>
git diff --stat origin/<base>...origin/<head>
```

diff는 파일별로 나눠 읽는다(`git diff origin/<base>...origin/<head> -- <path>`). 커밋 메시지만 보고 쓰지 않는다.

## 3. 관련 결정 찾기

노션 결정 기록 DB(`collection://15ac7d78-9ef9-4797-a7b2-687cc22c49e3`)에서 이 변경과 관련된 결정을 찾는다. 실제로 관련된 것만 "왜" 섹션에 `DEC-n 질문` 형태로 링크한다. 없으면 링크하지 않는다.

## 4. 초안 작성

템플릿 섹션 구조를 그대로 따른다.

- **제목**: `type: 한국어 요약`. 커밋이 하나면 그 커밋 제목을 쓴다.
- **무엇을 / 왜**: 리뷰어가 diff를 열기 전에 의도를 알 수 있게 쓴다.
- **주요 변경**: 커밋이나 의도 단위로 묶는다. 파일 나열은 하지 않는다.
- **스크린샷**: 화면 변경이 없으면 섹션을 지운다. 있으면 사용자에게 첨부를 요청한다.
- **검증**: 이 세션에서 실제로 통과를 확인한 항목만 체크한다. 나머지는 비워 두고 초안과 함께 알린다.
- **확인할 부분**: 독자는 리뷰하는 사람이다. 구현하면서 Claude가 판단한 것과 머지 전에 사람이 꼭 이해해야 할 코드를 `file:line`으로 짚는다. 고른 안과 기각한 안을 함께 적는다.
- 본문 마지막 줄에 `🤖 Generated with [Claude Code](https://claude.com/claude-code)`를 붙인다.

제목과 본문을 보여주고 **확인을 기다린다.** 수정 요청은 반영해서 다시 보여준다.

## 5. 생성

확인받으면 본문을 임시 파일(스크래치 디렉터리)에 쓰고 실행한다.

```bash
gh pr create --base <base> --head <head> --title "<제목>" --body-file <임시 파일> --assignee @me
```

PR 링크를 알려준다. 노션 할 일 DB(`collection://9fc082fa-db9c-4799-95b8-6eed9d06359c`)에 이 작업에 해당하는 할 일이 있으면, PR 속성에 링크를 넣을지 묻는다.
