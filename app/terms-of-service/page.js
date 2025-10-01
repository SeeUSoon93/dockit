"use client";

import { Div, Typography } from "sud-ui";

export default function TermsOfServicePage() {
  return (
    <Div className="flex flex-col items-center pd-y-50">
      <div className="max-w-px-800 w-100 flex flex-col gap-20 items-center">
        <Typography as="h1" size="3xl" pretendard="B">
          이용약관
        </Typography>

        <Div background="white-10" className="pd-20 rad-10 shadow-sm">
          <div className="flex flex-col gap-30">
            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제1조 (목적)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                본 약관은 Dockit(이하 &quot;서비스&quot;)이 제공하는 문서 작성
                및 관리 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무
                및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제2조 (정의)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • &quot;서비스&quot;란 Dockit이 제공하는 문서 작성, 편집,
                    저장 및 관리 서비스를 의미합니다.
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는
                    서비스를 이용하는 회원 및 비회원을 말합니다.
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • &quot;회원&quot;이란 서비스에 접속하여 본 약관에 따라
                    회사와 이용계약을 체결하고 서비스를 이용하는 자를
                    의미합니다.
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제3조 (약관의 효력 및 변경)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이
                발생합니다.
                <br />
                ② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본
                약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해
                공지합니다.
                <br />③ 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을
                중단하고 탈퇴할 수 있습니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제4조 (서비스의 제공)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 회사는 다음과 같은 서비스를 제공합니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 문서 작성 및 편집 서비스
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 문서 저장 및 관리 서비스
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 문서 공유 서비스
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는
                    일체의 서비스
                  </Typography>
                </li>
              </ul>
              <Typography size="sm" color="cool-gray-8" className="mg-t-10">
                ② 회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수
                있습니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제5조 (회원가입)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본
                약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
                <br />② 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자
                중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 등록 내용에 허위, 기재누락, 오기가 있는 경우
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이
                    있다고 판단되는 경우
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제6조 (회원 탈퇴 및 자격 상실)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 회원은 언제든지 서비스 내 회원 탈퇴 기능을 통해 이용계약 해지
                신청을 할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.
                <br />② 회원이 다음 각 호의 사유에 해당하는 경우, 회사는
                회원자격을 제한 및 정지시킬 수 있습니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 가입 신청 시에 허위 내용을 등록한 경우
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등
                    전자거래질서를 위협하는 경우
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 서비스를 이용하여 법령과 본 약관이 금지하거나 공서양속에
                    반하는 행위를 하는 경우
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제7조 (회원의 의무)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 회원은 다음 행위를 하여서는 안 됩니다.
              </Typography>
              <ul className="mg-t-10 mg-l-20">
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 신청 또는 변경 시 허위내용의 등록
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 타인의 정보도용
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 회사가 게시한 정보의 변경
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신
                    또는 게시
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해
                  </Typography>
                </li>
                <li>
                  <Typography size="sm" color="cool-gray-8">
                    • 기타 불법적이거나 부당한 행위
                  </Typography>
                </li>
              </ul>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제8조 (저작권의 귀속 및 이용제한)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① Dockit 서비스(플랫폼, 소프트웨어, UI/UX, 로고 등)에 대한
                저작권 및 지적재산권은 회사에 귀속됩니다.
                <br />
                ② 회원이 Dockit을 이용하여 작성한 문서 및 콘텐츠에 대한 저작권은
                해당 회원에게 귀속됩니다.
                <br />
                ③ 회사는 회원이 작성한 문서를 회원의 명시적 동의 없이 영리
                목적으로 사용하지 않습니다.
                <br />④ 이용자는 Dockit 서비스 자체를 회사의 사전 승낙 없이
                복제, 수정, 배포, 판매하거나 제3자에게 이용하게 하여서는 안
                됩니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제9조 (면책조항)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                ① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                <br />
                ② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여
                책임을 지지 않습니다.
                <br />③ 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한
                것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은
                자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </Typography>
            </div>

            <div className="flex flex-col">
              <Typography size="lg" pretendard="SB" className="mg-b-10">
                제10조 (관할법원)
              </Typography>
              <Typography size="sm" color="cool-gray-8">
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의
                소재지를 관할하는 법원을 관할법원으로 합니다.
              </Typography>
            </div>

            <div className="flex items-center justify-center">
              <Typography
                size="sm"
                pretendard="B"
                color="cool-gray-8"
                className="mg-t-20"
              >
                부칙
                <br />본 약관은 2025년 10월 1일부터 시행됩니다.
              </Typography>
            </div>
          </div>
        </Div>
      </div>
    </Div>
  );
}
