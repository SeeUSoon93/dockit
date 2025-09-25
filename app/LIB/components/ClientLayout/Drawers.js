import SettingDrawer from "./drawer/SettingDrawer";
import WidgetDrawer from "./drawer/WidgetDrawer";
import { useDrawerContext } from "../../context/DrawerContext";

export default function Drawers() {
  const {
    openLeftDrawer,
    openWidgetDrawer,
    openSettingsDrawer,
    setOpenLeftDrawer,
    setOpenWidgetDrawer,
    setOpenSettingsDrawer,
  } = useDrawerContext();

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
