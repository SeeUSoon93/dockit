import { Drawer, Input, Switch, Typography } from "sud-ui";
import Template from "./Template";
import { AiFillSave } from "react-icons/ai";
import { useSetting } from "@/app/LIB/context/SettingContext";
import { useState } from "react";
import { TbClockRecord } from "react-icons/tb";

export default function SettingDrawer({
  openSettingsDrawer,
  setOpenSettingsDrawer
}) {
  const { setting, setSetting, settingLoading } = useSetting();

  const [autoSave, setAutoSave] = useState(setting.autoSave);
  const [autoSaveDelay, setAutoSaveDelay] = useState(setting.autoSaveDelay);

  const handleChange = (key, value) => {
    setSetting({ ...setting, [key]: value });
  };

  return (
    <Drawer
      open={openSettingsDrawer}
      onClose={() => setOpenSettingsDrawer(false)}
    >
      <Template
        title="설정"
        content={
          !settingLoading && (
            <div className="flex flex-col gap-10">
              {/* 자동저장 */}
              <div className="flex items-center justify-between">
                <Typography pretendard="SB" className="flex items-center gap-5">
                  <AiFillSave size={20} />
                  자동 저장
                </Typography>
                <Switch
                  checked={autoSave}
                  onChange={() => {
                    handleChange("autoSave", !autoSave);
                    setAutoSave(!autoSave);
                  }}
                  size="sm"
                  onColor="mint"
                  offColor="mint-3"
                  onText="활성화"
                  offText="비활성화"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Typography
                    pretendard="SB"
                    className="flex items-center gap-5"
                  >
                    <TbClockRecord size={20} />
                    자동 저장 지연 시간
                  </Typography>
                  <Input
                    type="number"
                    value={autoSaveDelay}
                    onChange={(e) => {
                      handleChange("autoSaveDelay", e.target.value);
                      setAutoSaveDelay(e.target.value);
                    }}
                    style={{ width: "100px" }}
                    shadow="none"
                    size="sm"
                    suffix="ms"
                  />
                </div>
                <div className="flex justify-end">
                  <Typography size="xs" color="red-7">
                    * 1000ms = 1s
                  </Typography>
                </div>
              </div>
            </div>
          )
        }
      />
    </Drawer>
  );
}
