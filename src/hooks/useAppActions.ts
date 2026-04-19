import { useMemo } from 'react';
import type { useAppState } from '@/hooks/useAppState';

type AppApi = ReturnType<typeof useAppState>;

export interface DailyActions {
  toggleDailyTask: AppApi['toggleDailyTask'];
  addDailyTask: AppApi['addDailyTask'];
  deleteDailyTask: AppApi['deleteDailyTask'];
  editDailyTask: AppApi['editDailyTask'];
}

export interface DeepActions {
  toggleDeepTask: AppApi['toggleDeepTask'];
  addDeepTask: AppApi['addDeepTask'];
  deleteDeepTask: AppApi['deleteDeepTask'];
  resetDeepRoom: AppApi['resetDeepRoom'];
  completeMaintenanceRoom: AppApi['completeMaintenanceRoom'];
}

export interface ChallengeActions {
  toggleChallengeDay: AppApi['toggleChallengeDay'];
  toggleSpecialtyItem: AppApi['toggleSpecialtyItem'];
  addCustomSpecialtyItem: AppApi['addCustomSpecialtyItem'];
  deleteCustomSpecialtyItem: AppApi['deleteCustomSpecialtyItem'];
}

export interface FamilyActions {
  setFamilySize: AppApi['setFamilySize'];
  toggleFamilyTask: AppApi['toggleFamilyTask'];
  addFamilyTask: AppApi['addFamilyTask'];
  deleteFamilyTask: AppApi['deleteFamilyTask'];
  updateFamilyMember: AppApi['updateFamilyMember'];
  toggleActiveMember: AppApi['toggleActiveMember'];
  swapTasks: AppApi['swapTasks'];
  issueVoucher: AppApi['issueVoucher'];
  redeemVoucher: AppApi['redeemVoucher'];
  deleteVoucher: AppApi['deleteVoucher'];
}

export interface NotesActions {
  updateNote: AppApi['updateNote'];
  addBrainDump: AppApi['addBrainDump'];
  deleteBrainDump: AppApi['deleteBrainDump'];
  clearBrainDump: AppApi['clearBrainDump'];
}

export interface SystemActions {
  setDay: AppApi['setDay'];
  toggleSound: AppApi['toggleSound'];
  toggleShowTips: AppApi['toggleShowTips'];
  toggleUseEmoji: AppApi['toggleUseEmoji'];
  setUserName: AppApi['setUserName'];
  pickRandomDay: AppApi['pickRandomDay'];
  setUiMode: AppApi['setUiMode'];
  pickQuickStartTask: AppApi['pickQuickStartTask'];
  clearQuickStartTask: AppApi['clearQuickStartTask'];
  backup: AppApi['backup'];
  restore: AppApi['restore'];
  factoryReset: AppApi['factoryReset'];
}

export interface GroupedActions {
  daily: DailyActions;
  deep: DeepActions;
  challenge: ChallengeActions;
  family: FamilyActions;
  notes: NotesActions;
  system: SystemActions;
}

export function useAppActions(app: AppApi): GroupedActions {
  return useMemo<GroupedActions>(
    () => ({
      daily: { toggleDailyTask: app.toggleDailyTask, addDailyTask: app.addDailyTask, deleteDailyTask: app.deleteDailyTask, editDailyTask: app.editDailyTask },
      deep: { toggleDeepTask: app.toggleDeepTask, addDeepTask: app.addDeepTask, deleteDeepTask: app.deleteDeepTask, resetDeepRoom: app.resetDeepRoom, completeMaintenanceRoom: app.completeMaintenanceRoom },
      challenge: { toggleChallengeDay: app.toggleChallengeDay, toggleSpecialtyItem: app.toggleSpecialtyItem, addCustomSpecialtyItem: app.addCustomSpecialtyItem, deleteCustomSpecialtyItem: app.deleteCustomSpecialtyItem },
      family: { setFamilySize: app.setFamilySize, toggleFamilyTask: app.toggleFamilyTask, addFamilyTask: app.addFamilyTask, deleteFamilyTask: app.deleteFamilyTask, updateFamilyMember: app.updateFamilyMember, toggleActiveMember: app.toggleActiveMember, swapTasks: app.swapTasks, issueVoucher: app.issueVoucher, redeemVoucher: app.redeemVoucher, deleteVoucher: app.deleteVoucher },
      notes: { updateNote: app.updateNote, addBrainDump: app.addBrainDump, deleteBrainDump: app.deleteBrainDump, clearBrainDump: app.clearBrainDump },
      system: { setDay: app.setDay, toggleSound: app.toggleSound, toggleShowTips: app.toggleShowTips, toggleUseEmoji: app.toggleUseEmoji, setUserName: app.setUserName, pickRandomDay: app.pickRandomDay, setUiMode: app.setUiMode, pickQuickStartTask: app.pickQuickStartTask, clearQuickStartTask: app.clearQuickStartTask, backup: app.backup, restore: app.restore, factoryReset: app.factoryReset },
    }),
    [app.toggleDailyTask, app.addDailyTask, app.deleteDailyTask, app.editDailyTask, app.toggleDeepTask, app.addDeepTask, app.deleteDeepTask, app.resetDeepRoom, app.completeMaintenanceRoom, app.toggleChallengeDay, app.toggleSpecialtyItem, app.addCustomSpecialtyItem, app.deleteCustomSpecialtyItem, app.setFamilySize, app.toggleFamilyTask, app.addFamilyTask, app.deleteFamilyTask, app.updateFamilyMember, app.toggleActiveMember, app.swapTasks, app.issueVoucher, app.redeemVoucher, app.deleteVoucher, app.updateNote, app.addBrainDump, app.deleteBrainDump, app.clearBrainDump, app.setDay, app.toggleSound, app.toggleShowTips, app.toggleUseEmoji, app.setUserName, app.pickRandomDay, app.setUiMode, app.pickQuickStartTask, app.clearQuickStartTask, app.backup, app.restore, app.factoryReset],
  );
}
