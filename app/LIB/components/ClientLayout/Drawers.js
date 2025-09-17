import SettingDrawer from "./Drawer/SettingDrawer";
import WidgetDrawer from "./Drawer/WidgetDrawer";

export default function Drawers({
  openLeftDrawer,
  setOpenLeftDrawer,
  openWidgetDrawer,
  setOpenWidgetDrawer,
  openSettingsDrawer,
  setOpenSettingsDrawer
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
