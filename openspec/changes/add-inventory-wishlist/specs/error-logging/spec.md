## ADDED Requirements

### Requirement: 에러 로그 기록
시스템은 처리되지 않은 라우트 에러와 Server Action 실패를 `error_logs` 테이블에 기록해야 한다(SHALL). 저장 항목은 메시지·라우트명·에러 digest에 한정되며, stack trace와 URL 쿼리스트링은 저장하지 않아야 한다(MUST NOT).

#### Scenario: 라우트 에러 기록
- **WHEN** 라우트 렌더링 중 처리되지 않은 에러가 발생한다
- **THEN** 시스템은 `app/error.tsx`를 표시하고 해당 에러의 메시지와 라우트명을 1회 기록한다

#### Scenario: Server Action 실패 기록
- **WHEN** Server Action 실행 중 실패로 에러를 던진다
- **THEN** 시스템은 던지기 전에 동일한 메시지와 액션명을 기록한다

#### Scenario: 민감정보 미저장
- **WHEN** 에러에 stack trace나 쿼리스트링이 포함되어 있다
- **THEN** 시스템은 그것들을 저장하지 않고 메시지와 라우트명만 저장한다

### Requirement: 사용자별 로그 격리
시스템은 각 사용자가 자신의 에러 로그만 조회·기록할 수 있도록 SHALL 보장해야 한다. 비로그인 상태의 에러는 DB에 기록하지 않고 화면만 표시해야 한다(SHALL).

#### Scenario: 본인 로그만 조회
- **WHEN** 사용자가 자신의 에러 로그를 조회한다
- **THEN** 시스템은 해당 사용자의 로그만 반환한다

#### Scenario: 타인 로그 접근 차단
- **WHEN** 사용자 A가 사용자 B의 에러 로그에 접근한다
- **THEN** 시스템은 요청을 거부하고 데이터를 노출하지 않는다

#### Scenario: 로깅 실패 시 UI 정상
- **WHEN** 로그 기록 자체가 실패한다
- **THEN** 시스템은 에러 화면 표시와 "다시 시도" 동작을 정상적으로 유지한다
