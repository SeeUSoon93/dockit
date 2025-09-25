import SettingDrawer from "./drawer/SettingDrawer";
import WidgetDrawer from "./drawer/WidgetDrawer";

export default function Drawers({
  openLeftDrawer,
  setOpenLeftDrawer,
  openWidgetDrawer,
  setOpenWidgetDrawer,
  openSettingsDrawer,
  setOpenSettingsDrawer,
}) {
  return (
    <>
      <SettingDrawer
        openSettingsDrawer={openSettingsDrawer}
        setOpenSettingsDrawer={setOpenSettingsDrawer}
      />
      <WidgetDrawer
        openWidgetDrawer={openWidgetDrawer}
        setOpenWidgetDrawer={setOpenWidgetDrawer}
      />
    </>
  );
}
