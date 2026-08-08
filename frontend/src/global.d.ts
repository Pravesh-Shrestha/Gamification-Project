export {};

declare global {
  interface Window {
    Analytics?: any;
    DB?: any;
    Engine?: any;
    Store?: any;
    Gamify?: any;
    FX?: any;
    CURRICULUM?: any;
    allLessons?: any;
    findLesson?: any;
    findSubject?: any;
    AIO_MUTED?: any;
    webkitAudioContext?: typeof AudioContext;
    [key: string]: any;
  }

  // Global JSX Component Declarations for legacy window-attached components
  var RoleShell: any;
  var RoleTabs: any;
  var CockpitBanner: any;
  var BigStat: any;
  var SectionHeader: any;
  var Leaderboard: any;
  var Logo: any;
  var StatTile: any;
  var LessonPlayer: any;
  var Toasts: any;
  var LootboxModal: any;
  var StudentHome: any;
  var LearnHub: any;
  var QuestsTab: any;
  var FocusMode: any;
  var Locker: any;
  var Profile: any;
  var EngineLog: any;
  var TweaksPanel: any;
  var TweakSection: any;
  var TweakRadio: any;
  var TweakSlider: any;
  var TweakToggle: any;
  var TweakButton: any;
  var ChatBot: any;
  var SubjectMark: any;
  var EquippedAvatar: any;
  var ClassFeed: any;
  var QuestCard: any;
  var Modal: any;
  var Select: any;
  var Field: any;
  var Pill: any;
  var RowStat: any;
  var ProgressRing: any;
  var Analytics: any;
  var CodedexLoadingScreen: any;
  var useTweaks: any;
}
