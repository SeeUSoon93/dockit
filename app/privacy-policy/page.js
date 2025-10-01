"use client";

import { Div, Typography } from "sud-ui";

export default function PrivacyPolicyPage() {
  return (
    <Div className="flex flex-col items-center pd-y-50">
      <div className="max-w-px-800 w-100 flex flex-col gap-20 items-center">
        <Typography as="h1" size="3xl" pretendard="B">
          개인정보처리방침
        </Typography>

        <Div background="white-10" className="pd-20 rad-10 shadow-sm ">
          <div className="flex flex-col gap-30">
            <div className="flex flex-col ">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                1. 개인정보의 처리 목적
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                Dockit은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고
                있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한
                조치를 이행할 예정입니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스
                    제공에 따른 본인 식별·인증
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 서비스 제공: 문서 작성 및 저장 서비스 제공
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                2. 처리하는 개인정보의 항목
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                Dockit은 다음의 개인정보 항목을 처리하고 있습니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 필수항목: 이메일, 이름, 프로필 사진 (Google 로그인 시
                    제공)
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 자동 수집 항목: 접속 IP, 쿠키, 서비스 이용 기록
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                3. 개인정보의 처리 및 보유 기간
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                Dockit은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
                개인정보를 처리·보유합니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 회원 탈퇴 시까지 (단, 관계법령 위반에 따른 수사·조사 등이
                    진행중인 경우에는 해당 수사·조사 종료 시까지)
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                4. 정보주체의 권리·의무 및 그 행사방법
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                정보주체는 Dockit에 대해 언제든지 다음 각 호의 개인정보 보호
                관련 권리를 행사할 수 있습니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 개인정보 열람 요구
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 오류 등이 있을 경우 정정 요구
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 삭제 요구
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 처리정지 요구
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                5. 개인정보의 파기
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                Dockit은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                6. 개인정보 보호책임자
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                Dockit은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
                처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
                같이 개인정보 보호책임자를 지정하고 있습니다.
              </Typography>
              <div className="mg-t-10 pd-10 bg-cool-gray-1 rad-5">
                <Typography size="sm" color="cool-gray-8">
                  담당자: Dockit 관리자
                  <br />
                  이메일: rlarnstns@gmail.com
                </Typography>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Typography
                size="sm"
                pretendard="B"
                color="cool-gray-8"
                className="mg-t-20"
              >
                본 개인정보처리방침은 2025년 10월 1일부터 적용됩니다.
              </Typography>
            </div>
          </div>
        </Div>
      </div>
    </Div>
  );
}
