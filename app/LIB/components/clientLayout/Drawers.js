import SettingDrawer from "./drawer/SettingDrawer";
import WidgetDrawer from "./drawer/WidgetDrawer";
import { useDrawerContext } from "../../context/DrawerContext";
import LeftDrawer from "./drawer/LeftDrawer";
import UserDrawer from "./drawer/UserDrawer";

export default function Drawers() {
  const {
    openLeftDrawer,
    openWidgetDrawer,
    openSettingsDrawer,
    openUserDrawer,
    setOpenLeftDrawer,
    setOpenWidgetDrawer,
    setOpenSettingsDrawer,
    setOpenUserDrawer,
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
      <LeftDrawer
        openLeftDrawer={openLeftDrawer}
        setOpenLeftDrawer={setOpenLeftDrawer}
      />
      <UserDrawer
        openUserDrawer={openUserDrawer}
        setOpenUserDrawer={setOpenUserDrawer}
      />
    </>
  );
}
