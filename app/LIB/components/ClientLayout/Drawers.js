import SettingDrawer from "./Drawer/SettingDrawer";

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
    </>
  );
}
