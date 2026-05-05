import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, ArrowUp, ArrowLeft, Sparkles, Upload, FileText,
  GitBranch, Search, X, ChevronRight, ChevronUp, ChevronDown, Plus,
  PanelLeftClose, PanelLeftOpen, MoreHorizontal, MessageSquarePlus,
  Send, Paperclip, AtSign, Eye, Check, CheckCircle2, CircleAlert,
  AlertCircle, PenLine, FolderOpen, Library, MessagesSquare, Pin,
  History, User, Bell, Settings, LogOut, Languages, FileCheck2,
  Loader2, ChevronsRight, PanelRightOpen, PanelRightClose, Globe,
  LayoutDashboard, LayoutGrid, Filter, ListChecks, BarChart3, ClipboardCheck,
  Lightbulb, Cpu, GitPullRequestArrow, FileSearch,
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  ImagePlus, Table2, Sigma, Link2, AlertTriangle,
} from "lucide-react";

/* =============================================================
 * Datapilot v6 — AI 对话作为产品中枢
 * 继承 v5 设计系统 (DESIGN_SYSTEM.md)
 * 新增 IA 规范 (IA_v6.md)
 * 视口目标: 1280 × 720 (13 寸笔记本)
 * ============================================================= */

// ============================================================
// 0. 持久化 + 用户 schema + Context
// ============================================================

// useLocalStorage — state 自动持久化到 localStorage
// 用法: const [val, setVal] = useLocalStorage("datapilot:foo", defaultVal);
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch (e) { /* JSON 解析失败 — 退回到默认值 */ }
    return initialValue;
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* localStorage 不可用 / 配额超限 — 静默忽略 */ }
  }, [key, value]);
  return [value, setValue];
}

// USERS — 多角色 schema(Demo 阶段 mock,生产环境从后端读)
const USERS = [
  {
    id: "wenyuan",
    name: "张文远",
    initial: "文",
    email: "wenyuan@hd-chip.com",
    role: "PM · 电源管理 BU",
    color: { bg: "#E8E2FF", ink: "#3A23B0" },
  },
  {
    id: "chenyue",
    name: "陈悦",
    initial: "悦",
    email: "chenyue@hd-chip.com",
    role: "高级 PM · 电源管理 BU",
    color: { bg: "#FCE7E7", ink: "#9B1C1C" },
  },
  {
    id: "lizhiqiang",
    name: "李志强",
    initial: "强",
    email: "lizhiqiang@hd-chip.com",
    role: "PE · 电源管理 BU",
    color: { bg: "#DBEAFE", ink: "#1E40AF" },
  },
];
const DEFAULT_USER_ID = "wenyuan";
function getUserById(id) {
  return USERS.find(u => u.id === id) || USERS[0];
}

// Context — 全局当前用户(主区组件按需读取)
const CurrentUserContext = React.createContext(USERS[0]);
const useCurrentUser = () => React.useContext(CurrentUserContext);

// ============================================================
// 1. 全局样式 + tokens
// ============================================================
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600&display=swap');

    :root {
      --bg-app: #DDD6E8;          /* 整页底色 - 淡紫,只在面板间的缝隙处显示 */
      --bg: #FAFAFE;
      --bg-card: #FFFFFF;
      --bg-sidebar: #FFFFFF;      /* 左侧栏 - 白底(跟主区一致) */
      --bg-ai: #FFFFFF;           /* AI 对话区 - 白底(跟主区一致) */
      --bg-subtle: #F4F2FA;
      --bg-hover: #EEEAF7;

      --ink: #181426;
      --ink-2: #3A3550;
      --ink-3: #6B6680;
      --ink-4: #A8A3BC;

      --accent: #5847CC;
      --accent-soft: #E8E2FF;
      --accent-ink: #3A23B0;

      --border: #E4DFF0;
      --border-strong: #C9C2DD;

      --success: #2E8B5A;
      --success-soft: #E5F5EC;
      --warning: #D89020;
      --warning-soft: #FCEFCB;
      --danger: #DC3D5C;
      --danger-soft: #FBE5EA;
      --info: #3B82F6;
      --info-soft: #DBEAFE;

      --lumy-l: #8E37D6;
      --lumy-u: #DC3D5C;
      --lumy-m: #3EBE67;
      --lumy-y: #1FA7E0;
    }

    .font-display { font-family: 'Fraunces', 'Noto Sans SC', serif; font-optical-sizing: auto; }
    .font-body { font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #C9C2DD; border-radius: 4px; border: 2px solid var(--bg);
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #A89FBE; }

    ::selection { background: #E8E2FF; color: #3A23B0; }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .anim-fade-up { animation: fade-up 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }

    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .anim-slide-right { animation: slide-in-right 0.3s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }

    @keyframes slide-in-left {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .anim-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }

    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .anim-scale-in { animation: scale-in 0.2s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }

    @keyframes menu-pop-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .anim-menu-up { animation: menu-pop-up 0.2s cubic-bezier(0.2, 0.7, 0.2, 1) backwards; }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .anim-spin { animation: spin 0.8s linear infinite; }

    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .thinking-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse-soft 1.4s ease-in-out infinite;
      display: inline-block;
    }
    .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
  `}</style>
);

// ============================================================
// 2. Logo + LumyBrand (沿用 v5)
// ============================================================
const Logo = ({ size = 28 }) => (
  <div
    className="rounded-[8px] flex-shrink-0 relative overflow-hidden"
    style={{ width: size, height: size, boxShadow: "0 1px 3px rgba(91, 63, 224, 0.25)" }}
  >
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
      <div style={{ background: "var(--lumy-l)" }} />
      <div style={{ background: "var(--lumy-u)" }} />
      <div style={{ background: "var(--lumy-m)" }} />
      <div style={{ background: "var(--lumy-y)" }} />
    </div>
    <div
      className="absolute inset-0 flex items-center justify-center font-display font-bold text-white"
      style={{
        fontSize: size * 0.55,
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      D
    </div>
  </div>
);

const LumyBrand = ({ size = 12 }) => (
  <span
    className="font-display font-extrabold tracking-tight inline-flex items-baseline"
    style={{ fontSize: size, letterSpacing: "-0.04em", lineHeight: 1 }}
  >
    <span style={{ color: "var(--lumy-l)" }}>L</span>
    <span style={{ color: "var(--lumy-u)" }}>U</span>
    <span style={{ color: "var(--lumy-m)" }}>M</span>
    <span style={{ color: "var(--lumy-y)" }}>Y</span>
  </span>
);

// ============================================================
// 3. Button + IconButton (沿用 v5)
// ============================================================
const Button = ({
  children, variant = "primary", size = "md",
  icon: Icon, iconRight: IconRight,
  onClick, disabled, className = "", title,
}) => {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const sizes = {
    sm: "h-8 px-3 text-[12px] rounded-[8px]",
    md: "h-9 px-3.5 text-[13px] rounded-[10px]",
    lg: "h-11 px-5 text-[14px] rounded-[12px]",
  };
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)] active:scale-[0.98]",
    secondary: "bg-white text-[var(--ink)] border border-[var(--border)] hover:bg-[#EEEAF7] hover:border-[var(--border-strong)]",
    ghost: "text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]",
    soft: "bg-[var(--accent-soft)] text-[var(--accent-ink)] hover:bg-[#DCD2FF]",
  };
  const iconSize = size === "sm" ? 12 : size === "md" ? 13 : 14;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={2.2} />}
    </button>
  );
};

const IconButton = ({ icon: Icon, onClick, title, active, badge, size = "md" }) => {
  const sizes = { sm: "w-7 h-7", md: "w-8 h-8", lg: "w-9 h-9" };
  const iconSize = size === "sm" ? 13 : size === "md" ? 14 : 15;
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizes[size]} rounded-[8px] flex items-center justify-center transition-colors flex-shrink-0 relative ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
          : "text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
      }`}
    >
      <Icon size={iconSize} strokeWidth={2} />
      {badge && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
      )}
    </button>
  );
};

// ============================================================
// 3.5 ResizeHandle — 面板间的拖拽分隔条
//   side: "right" 拖右边界 / "left" 拖左边界
// ============================================================
// FloatingResizer — 浮在主区左边缘的拖拽条
//   不被 aside 的 overflow-hidden 切掉,跨越对话区/主区两侧各 4px 判定
//   位置:right = mainWidth - 4(主区左边缘减 4px)
const FloatingResizer = ({ mainWidth, onResize, minMain = 420 }) => {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = mainWidth;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - startXRef.current;
      // 鼠标向左 → 主区变宽;向右 → 主区变窄
      const newMainWidth = startWidthRef.current - dx;
      // 上限 = 浏览器宽 - LeftSidebar(240) - 对话区最小(360) - 各 gap padding(约 32)
      const maxMain = Math.max(minMain, window.innerWidth - 240 - 360 - 32);
      const clamped = Math.max(minMain, Math.min(maxMain, newMainWidth));
      onResize(clamped);
    };
    const onUp = () => setDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, minMain, onResize]);

  const showLine = dragging || hovered;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: mainWidth + 1,  // gap 是 8px,放在 gap 中间
        width: 8,
        cursor: "col-resize",
        zIndex: 50,
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          borderRadius: 999,
          background: showLine ? "var(--accent)" : "transparent",
          transition: "background 0.15s",
        }}
      />
    </div>
  );
};

const ResizeHandle = ({ onResize, side = "right", min = 200, max = 600, currentWidth }) => {
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = currentWidth;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - startXRef.current;
      const newWidth = side === "right"
        ? startWidthRef.current + dx
        : startWidthRef.current - dx;
      const clamped = Math.max(min, Math.min(max, newWidth));
      onResize(clamped);
    };
    const onUp = () => setDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, side, min, max, onResize]);

  const handleStyle = side === "right"
    ? { right: -8 }
    : { left: -8 };
  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute top-0 bottom-0 cursor-col-resize group"
      style={{
        ...handleStyle,
        width: 16,
        zIndex: 50,
        touchAction: "none",
      }}
    >
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full transition-colors ${
          dragging ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--border-strong)]"
        }`}
      />
    </div>
  );
};

// ============================================================
// 4. LeftSidebar — 加新对话按钮 + 对话历史
//    Linear 风格:圆角白色面板,不带 border
// ============================================================
const LeftSidebar = ({
  collapsed,
  setCollapsed,
  currentSection = "home",
  currentSubSection = null,
  onNewChat,
  onSelectSection,
  onSelectChat,
  currentChatId = null,
  chatHistory = [],
  currentUser = USERS[0],
  onSwitchUser,
  width = 240,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  // 两个大区的折叠状态
  const [chatAreaOpen, setChatAreaOpen] = useState(true);
  const [funcAreaOpen, setFuncAreaOpen] = useState(true);
  // 各功能模块的二级展开状态
  const [funcExpanded, setFuncExpanded] = useState({
    writing: true,   // 写作中心默认展开(高频)
    review: false,
    publish: false,
  });

  // 首页:独立渲染,放在"功能"标题之上
  const homeItem = { id: "home", icon: LayoutDashboard, label: "首页" };

  // badge 数 — 按当前用户的收件箱算
  const reviewCount = (REVIEW_INBOX[currentUser.id] || []).length;
  const publishCount = (PUBLISH_INBOX[currentUser.id] || []).length;

  // 功能区结构(完整)
  const funcModules = [
    { id: "writing",  icon: PenLine,         label: "写作中心",
      children: [
        { id: "writing-doing",     label: "写作中",   badge: 3 },
        { id: "writing-platform",  label: "平台库",  hint: "字段/术语/素材库" },
        { id: "writing-templates", label: "模板库",  hint: "企业 + Lumy 共享" },
      ],
    },
    { id: "products", icon: FolderOpen,      label: "产品中心",        single: true },
    { id: "review",   icon: FileCheck2,      label: "审核中心",      badge: reviewCount || undefined,
      children: [
        { id: "review-pending", label: "待我审核",  badge: reviewCount || undefined },
        { id: "review-history", label: "审核历史" },
      ],
    },
    { id: "publish",  icon: Send,            label: "发布中心",      badge: publishCount || undefined,
      children: [
        { id: "publish-pending", label: "待我发布",  badge: publishCount || undefined },
        { id: "publish-history", label: "发布历史" },
      ],
    },
  ];

  const profileMenu = [
    { icon: User,      label: "个人资料" },
    { icon: Bell,      label: "通知中心",  note: "3 条未读", noteAccent: true },
    { icon: Settings,  label: "偏好设置" },
    { icon: Languages, label: "语言",     note: "中文" },
    { divider: true },
    { icon: LogOut,    label: "退出登录",  danger: true },
  ];

  // 把对话历史按时间分组
  const groupedChats = {
    pinned:  chatHistory.filter(c => c.pinned),
    today:   chatHistory.filter(c => !c.pinned && c.group === "today"),
    week:    chatHistory.filter(c => !c.pinned && c.group === "week"),
    earlier: chatHistory.filter(c => !c.pinned && c.group === "earlier"),
  };

  // 收起态 — 只显图标
  if (collapsed) {
    return (
      <aside
        className="bg-white rounded-[12px] flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 56, boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)" }}
      >
        <div className="h-14 flex items-center justify-center border-b border-[var(--border)] flex-shrink-0">
          <Logo size={28} />
        </div>
        {/* 收起态:展开按钮 + 新对话按钮 */}
        <div className="px-2 pt-2 pb-1 flex flex-col items-center gap-1.5 flex-shrink-0">
          <IconButton icon={PanelLeftOpen} onClick={() => setCollapsed(false)} title="展开 [" size="sm" />
          <button
            onClick={onNewChat}
            title="新对话 ⌘N"
            className="w-10 h-10 rounded-[10px] bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[var(--accent-ink)] transition-colors shadow-[0_2px_6px_rgba(91,63,224,0.25)]"
          >
            <MessageSquarePlus size={16} strokeWidth={2.2} />
          </button>
        </div>
        <nav className="flex-1 py-3 flex flex-col items-center gap-1 overflow-y-auto scrollbar-thin">
          {/* 首页 — 独立第一项 */}
          <IconButton
            icon={homeItem.icon}
            title={homeItem.label}
            active={currentSection === homeItem.id}
            onClick={() => onSelectSection?.(homeItem.id)}
            size="md"
          />
          {/* 分隔线 */}
          <div className="w-6 h-[1px] bg-[var(--border)] my-1" />
          {/* 功能项 */}
          {funcModules.map(item => (
            <IconButton
              key={item.id}
              icon={item.icon}
              title={item.label}
              active={currentSection === item.id}
              badge={item.badge}
              onClick={() => onSelectSection?.(item.id)}
              size="md"
            />
          ))}
        </nav>
        <div className="h-12 px-2 border-t border-[var(--border)] flex items-center justify-center flex-shrink-0 relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-full text-[11px] font-semibold flex items-center justify-center hover:ring-2 hover:ring-[var(--accent)] hover:ring-offset-1 hover:ring-offset-white transition-all relative"
            style={{ background: currentUser.color.bg, color: currentUser.color.ink }}
            title={currentUser.name}
          >
            {currentUser.initial}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--warning)] ring-[1.5px] ring-white" />
          </button>
          {profileOpen && (
            <div
              className="absolute left-full bottom-0 ml-2 w-52 bg-white border border-[var(--border)] rounded-[12px] overflow-hidden anim-menu-up"
              style={{ zIndex: 30, boxShadow: "0 12px 40px rgba(24,20,38,0.12)" }}
            >
              <ProfileMenuContent
                items={profileMenu}
                onClose={() => setProfileOpen(false)}
                currentUser={currentUser}
                onSwitchUser={onSwitchUser}
              />
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 展开态
  return (
    <aside
      className="bg-white rounded-[12px] flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width, boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)" }}
    >
      {/* 顶部 Logo */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Logo size={26} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-[13px] text-[var(--ink)] leading-tight truncate">Datapilot</div>
            <div className="font-mono text-[11px] text-[var(--ink-3)] leading-tight truncate">华东芯片</div>
          </div>
        </div>
        <IconButton icon={PanelLeftClose} onClick={() => setCollapsed(true)} title="收起 [" size="sm" />
      </div>

      {/* 滚动区:对话区 + 功能区 */}
      <nav className="flex-1 px-2 pt-2 overflow-y-auto scrollbar-thin">
        {/* === 首页(独立项,在"功能"标题之上)=== */}
        <button
          onClick={() => onSelectSection?.(homeItem.id)}
          className={`w-full flex items-center gap-1.5 px-2.5 h-9 mt-1 mb-1 rounded-[8px] text-[14px] transition-colors ${
            currentSection === homeItem.id && !currentChatId
              ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
              : "text-[var(--ink)] hover:bg-[#F4F2FA]"
          }`}
        >
          <homeItem.icon size={13} strokeWidth={2} className="flex-shrink-0 text-[var(--ink-3)]" />
          <span className="flex-1 text-left">{homeItem.label}</span>
        </button>

        {/* === 功能区 === */}
        <SectionHeader
          label="功能"
          icon={LayoutGrid}
          isOpen={funcAreaOpen}
          onToggle={() => setFuncAreaOpen(!funcAreaOpen)}
        />
        {funcAreaOpen && (
          <div className="mb-3 space-y-0.5">
            {funcModules.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id && !currentChatId;
              if (item.single) {
                // 单层菜单(产品中心)
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectSection?.(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-[8px] text-[13px] transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                        : "text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.4 : 2} className="flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[11px] font-mono font-semibold px-1.5 rounded-full bg-[var(--warning)] text-white flex-shrink-0">{item.badge}</span>
                    )}
                  </button>
                );
              }
              // 多层菜单(写作中心 / 审核中心 / 发布中心)
              const expanded = funcExpanded[item.id];
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      setFuncExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                      onSelectSection?.(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-[8px] text-[13px] transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                        : "text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.4 : 2} className="flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[11px] font-mono font-semibold px-1.5 rounded-full bg-[var(--warning)] text-white flex-shrink-0">{item.badge}</span>
                    )}
                    <ChevronRight size={11} strokeWidth={2.4} className={`text-[var(--ink-3)] flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="mt-0.5 space-y-0.5">
                      {item.children.map(c => {
                        const childActive = currentSubSection === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => onSelectSection?.(c.id)}
                            title={c.hint}
                            className={`w-full flex items-center gap-2 pl-9 pr-2.5 h-7 rounded-[6px] text-[12px] transition-colors ${
                              childActive
                                ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                                : "text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
                            }`}
                          >
                            <span className="flex-1 text-left truncate">{c.label}</span>
                            {c.badge && (
                              <span className="text-[11px] font-mono font-semibold px-1.5 rounded-full bg-[var(--warning)] text-white flex-shrink-0">{c.badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* === 对话区 === */}
        <SectionHeader
          label="对话"
          icon={MessagesSquare}
          isOpen={chatAreaOpen}
          onToggle={() => setChatAreaOpen(!chatAreaOpen)}
        />
        {chatAreaOpen && (
          <div className="mb-3">
            {/* 新对话按钮 — 主紫,作为对话区的入口动作 */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-2.5 h-9 rounded-[8px] bg-[var(--accent)] text-[13px] font-medium text-white hover:bg-[var(--accent-ink)] transition-colors mb-1.5"
            >
              <MessageSquarePlus size={14} strokeWidth={2.2} />
              <span className="flex-1 text-left">新对话</span>
              <span className="font-mono text-[11px] opacity-80">⌘N</span>
            </button>
            <ChatHistoryGroup label="置顶" icon={Pin} chats={groupedChats.pinned} currentChatId={currentChatId} onSelect={onSelectChat} />
            <ChatHistoryGroup label="今天" chats={groupedChats.today} currentChatId={currentChatId} onSelect={onSelectChat} />
            <ChatHistoryGroup label="7 天内" chats={groupedChats.week} currentChatId={currentChatId} onSelect={onSelectChat} />
            <ChatHistoryGroup label="更早" chats={groupedChats.earlier} currentChatId={currentChatId} onSelect={onSelectChat} />
            {chatHistory.length === 0 && (
              <div className="px-2.5 py-2 text-[11px] text-[var(--ink-4)] italic">暂无对话</div>
            )}
          </div>
        )}

        <div className="h-2" />
      </nav>

      {/* 底部用户中心 */}
      <div className="h-12 px-2 border-t border-[var(--border)] relative flex-shrink-0 flex items-center">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center gap-2 px-2 h-9 rounded-[8px] transition-colors ${
            profileOpen ? "bg-[#EEEAF7]" : "hover:bg-[#EEEAF7]"
          }`}
        >
          <div
            className="relative w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center flex-shrink-0"
            style={{ background: currentUser.color.bg, color: currentUser.color.ink }}
          >
            {currentUser.initial}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--warning)] ring-[1.5px] ring-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[12px] font-medium text-[var(--ink)] truncate leading-tight">{currentUser.name}</div>
            <div className="text-[11px] text-[var(--ink-3)] truncate leading-tight">{currentUser.role}</div>
          </div>
          <ChevronUp size={11} className={`text-[var(--ink-3)] transition-transform flex-shrink-0 ${profileOpen ? "" : "rotate-180"}`} />
        </button>

        {profileOpen && (
          <div
            className="absolute left-2 right-2 bg-white border border-[var(--border)] rounded-[12px] overflow-hidden anim-menu-up"
            style={{ bottom: "calc(100% - 4px)", zIndex: 30, boxShadow: "0 12px 40px rgba(24,20,38,0.12)" }}
          >
            <ProfileMenuContent
              items={profileMenu}
              onClose={() => setProfileOpen(false)}
              currentUser={currentUser}
              onSwitchUser={onSwitchUser}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

// 大区标题(对话区 / 功能区)
const SectionHeader = ({ label, icon: Icon, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center gap-1.5 px-2.5 h-9 rounded-[8px] text-[var(--ink)] hover:bg-[#F4F2FA] transition-colors mt-1 mb-1 group"
  >
    {Icon && <Icon size={13} strokeWidth={2} className="flex-shrink-0 text-[var(--ink-3)]" />}
    <span className="text-[14px]">{label}</span>
  </button>
);

// 对话历史分组
const ChatHistoryGroup = ({ label, icon: Icon, chats, currentChatId, onSelect }) => {
  if (!chats || chats.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="px-2.5 h-7 flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] font-mono">
        {Icon && <Icon size={11} strokeWidth={2.4} />}
        <span>{label}</span>
        <span>·</span>
        <span>{chats.length}</span>
      </div>
      <div>
        {chats.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect?.(c.id)}
            className={`w-full flex items-center gap-2 px-2.5 h-7 rounded-[6px] text-[12px] text-left transition-colors ${
              currentChatId === c.id
                ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                : "text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
            }`}
            title={c.title}
          >
            <span className="flex-1 truncate">{c.title}</span>
            {c.taskState === "running" && <Loader2 size={10} className="text-[var(--info)] anim-spin flex-shrink-0" />}
            {c.taskState === "await" && <CircleAlert size={10} className="text-[var(--warning)] flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// 个人中心菜单
const ProfileMenuContent = ({ items, onClose, currentUser = USERS[0], onSwitchUser, allUsers = USERS }) => (
  <>
    <div className="px-3 pt-3 pb-2 border-b border-[var(--border)] bg-[#F4F2FA]">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full text-[12px] font-semibold flex items-center justify-center flex-shrink-0"
          style={{ background: currentUser.color.bg, color: currentUser.color.ink }}
        >
          {currentUser.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-[var(--ink)] truncate">{currentUser.name}</div>
          <div className="text-[11px] text-[var(--ink-3)] font-mono mt-0.5 truncate">{currentUser.email}</div>
        </div>
      </div>
    </div>
    {/* 切换角色(Demo)— 只有 onSwitchUser 提供时才显示 */}
    {onSwitchUser && allUsers.length > 1 && (
      <div className="border-b border-[var(--border)] py-1">
        <div className="px-3 pt-1 pb-0.5 text-[10px] text-[var(--ink-3)] tracking-wider uppercase font-mono">切换角色 · Demo</div>
        {allUsers.map(u => {
          const active = u.id === currentUser.id;
          return (
            <button
              key={u.id}
              onClick={() => {
                if (!active) {
                  onSwitchUser(u.id);
                  onClose();
                }
              }}
              className={`w-full flex items-center gap-2.5 px-3 h-9 transition-colors ${
                active ? "bg-[#EEEAF7]" : "hover:bg-[#EEEAF7]"
              }`}
            >
              <div
                className="w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center flex-shrink-0"
                style={{ background: u.color.bg, color: u.color.ink }}
              >
                {u.initial}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[12px] font-medium text-[var(--ink)] truncate leading-tight">{u.name}</div>
                <div className="text-[11px] text-[var(--ink-3)] truncate leading-tight">{u.role}</div>
              </div>
              {active && <Check size={13} strokeWidth={2.4} className="text-[var(--accent)] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    )}
    <div className="py-1">
      {items.map((item, i) => {
        if (item.divider) {
          return <div key={i} className="my-1 border-t border-[var(--border)]" />;
        }
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={onClose}
            className={`w-full flex items-center gap-2.5 px-3 h-8 text-[12px] transition-colors ${
              item.danger
                ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                : "text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
            }`}
          >
            <Icon size={13} strokeWidth={2} className="flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.note && (
              <span className={`text-[11px] font-mono ${item.noteAccent ? "text-[var(--accent)] font-semibold" : "text-[var(--ink-3)]"}`}>
                {item.note}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </>
);
// ============================================================
// 5. 对话气泡(两边都加底色) + 任务卡 + 思考态
// ============================================================

// ProductCard — 在 AI 气泡里展示的小产品卡片
const ProductCard = ({ ppn, title, status }) => (
  <div className="flex items-center gap-2 px-2.5 py-2 bg-white border border-[var(--border)] rounded-[8px] hover:border-[var(--accent)] transition-colors cursor-pointer">
    <div className="flex-1 min-w-0">
      <div className="font-mono text-[12px] font-semibold text-[var(--ink)] truncate">{ppn}</div>
      <div className="text-[11px] text-[var(--ink-2)] truncate" title={title}>{title}</div>
    </div>
    {status && (
      <span className="font-mono text-[10px] text-[var(--ink-3)] flex-shrink-0">{status}</span>
    )}
  </div>
);

// AI 气泡
const AIBubble = ({ children, className = "" }) => (
  <div className={`flex gap-2.5 anim-fade-up items-start ${className}`}>
    <div className="flex-shrink-0" style={{ marginTop: 6 }}>
      <Logo size={26} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="bg-[#F4F2FA] inline-block px-3.5 py-2.5 rounded-[14px] rounded-tl-[6px] max-w-full">
        <div className="text-[14px] text-[var(--ink)] leading-[1.65]">{children}</div>
      </div>
    </div>
  </div>
);

// 用户气泡 — 淡紫色底,不显示"你"标签(头像本身代表用户身份)
const UserBubble = ({ children }) => (
  <div className="flex justify-end gap-2.5 anim-fade-up items-start">
    <div className="max-w-[80%] pt-0.5">
      <div
        className="text-[14px] leading-[1.6] inline-block px-3.5 py-2.5 rounded-[14px] rounded-tr-[6px]"
        style={{ background: "#E8E2FF", color: "#181426" }}
      >
        {children}
      </div>
    </div>
    <div
      className="w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: "#E8E2FF", color: "#3A23B0" }}
    >
      文
    </div>
  </div>
);

// AI 思考态
const ThinkingBubble = ({ label = "正在思考" }) => (
  <div className="flex gap-2.5 anim-fade-up items-start">
    <div className="flex-shrink-0" style={{ marginTop: 6 }}>
      <Logo size={26} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="bg-[#F4F2FA] inline-block px-3.5 py-2.5 rounded-[14px] rounded-tl-[6px]">
        <div className="flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
          <span>{label}</span>
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>
      </div>
    </div>
  </div>
);

// 任务卡 — Claude 风格的思考流
//   不抢焦点的灰色细字,左侧细线 + 小图标
//   states: running / done / await / failed
const TaskCard = ({ state = "done", title, detail, onClick }) => {
  const config = {
    running: {
      icon: Loader2,
      iconColor: "var(--accent)",
      lineColor: "var(--accent)",
      labelColor: "var(--accent-ink)",
      label: "思考中",
      spin: true,
    },
    done: {
      icon: Check,
      iconColor: "var(--ink-3)",
      lineColor: "var(--border-strong)",
      labelColor: "var(--ink-3)",
      label: "完成",
      spin: false,
    },
    await: {
      icon: CircleAlert,
      iconColor: "var(--warning)",
      lineColor: "var(--warning)",
      labelColor: "#92400E",
      label: "待确认",
      spin: false,
    },
    failed: {
      icon: AlertCircle,
      iconColor: "var(--danger)",
      lineColor: "var(--danger)",
      labelColor: "#991B1B",
      label: "未完成",
      spin: false,
    },
  };
  const c = config[state] || config.done;
  const Icon = c.icon;

  return (
    <div
      className={`anim-fade-up flex items-start gap-2 pl-3 py-1 ${onClick ? "cursor-pointer hover:bg-[#FAFAFE] rounded-[6px]" : ""}`}
      style={{ borderLeft: `2px solid ${c.lineColor}` }}
      onClick={onClick}
    >
      <Icon
        size={11}
        strokeWidth={2.4}
        className={`flex-shrink-0 mt-1 ${c.spin ? "anim-spin" : ""}`}
        style={{ color: c.iconColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[11px] font-mono tracking-wider uppercase"
            style={{ color: c.labelColor }}
          >
            {c.label}
          </span>
          <span className="text-[12px] text-[var(--ink-2)] leading-snug">{title}</span>
        </div>
        {detail && (
          <div className="text-[11px] text-[var(--ink-3)] mt-0.5 leading-relaxed">
            {detail}
          </div>
        )}
      </div>
      {onClick && <ChevronRight size={11} className="flex-shrink-0 mt-1 text-[var(--ink-3)]" />}
    </div>
  );
};

// ============================================================
// 6. ChatInput (沿用 v5 略调整,加附件提示)
// ============================================================
const ChatInput = ({ value, onChange, onSubmit, placeholder, autoFocus, size = "md" }) => {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value?.trim()) onSubmit();
    }
  };
  const ref = useRef(null);
  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const isLg = size === "lg";

  return (
    <div className="bg-white border border-[var(--border)] rounded-[14px] focus-within:border-[var(--accent)] focus-within:shadow-[0_4px_16px_rgba(91,63,224,0.12)] transition-all">
      <textarea
        ref={ref}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        rows={1}
        className={`w-full bg-transparent text-[var(--ink)] placeholder-[var(--ink-4)] resize-none focus:outline-none ${
          isLg ? "px-5 pt-4 pb-2 text-[14px] leading-[1.55]" : "px-4 pt-3 pb-1.5 text-[14px] leading-[1.5]"
        }`}
        style={{ minHeight: isLg ? 28 : 24 }}
      />
      <div className={`flex items-center justify-between ${isLg ? "px-3 pb-2.5" : "px-2 pb-2"}`}>
        <div className="flex items-center gap-0.5">
          <IconButton icon={Paperclip} title="附件" size="sm" />
          <IconButton icon={AtSign} title="引用资源" size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--ink-4)] font-mono">
            <span className="border border-[var(--border-strong)] rounded px-1 py-0.5">↵</span> 发送
          </span>
          <button
            onClick={onSubmit}
            disabled={!value?.trim()}
            className={`rounded-[8px] bg-[var(--accent)] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent-ink)] transition-colors flex-shrink-0 ${
              isLg ? "w-9 h-9" : "w-7 h-7"
            }`}
          >
            <ArrowUp size={isLg ? 15 : 13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 7. ChatPanel — 独立可复用的对话面板
//    Idle 态用 size="lg",Working 态停靠时用 size="md"
//    内含:消息列表 + 输入框
// ============================================================
const ChatPanel = ({
  messages = [],
  thinking = false,
  thinkingLabel = "正在思考",
  inputValue,
  onInputChange,
  onSubmit,
  inputPlaceholder = "和 AI 说说你想做什么...",
  inputSize = "md",
  emptyState,
}) => {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* 消息流 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="px-4 py-4 space-y-3 max-w-[820px] mx-auto w-full">
          {messages.length === 0 && !thinking && emptyState}
          {messages.map((m, i) => {
            if (m.kind === "task") {
              return <TaskCard key={i} state={m.state} title={m.title} detail={m.detail} onClick={m.onClick} />;
            }
            if (m.kind === "thinking") {
              return <ThinkingBubble key={i} label={m.label || "正在思考"} />;
            }
            if (m.role === "ai") {
              return <AIBubble key={i}>{m.content}</AIBubble>;
            }
            return <UserBubble key={i}>{m.content}</UserBubble>;
          })}
          {thinking && <ThinkingBubble label={thinkingLabel} />}
          <div ref={endRef} />
        </div>
      </div>
      {/* 输入框 */}
      <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0">
        <div className="max-w-[820px] mx-auto w-full">
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onSubmit}
            placeholder={inputPlaceholder}
            size={inputSize}
          />
        </div>
      </div>
    </div>
  );
};
// ============================================================
// 8. IdleScreen — 空闲态(默认入口)
//    - 主区中央:大型对话窗 + 6 张快捷意图卡
//    - LeftSidebar 完整显示
//    - 没有右侧栏
// ============================================================
const IdleScreen = ({
  onIntent,                  // (intent, optional payload) => void
  onOnboardingComplete,      // (projectType, refDescription, targetVersion) => void
  greeting = "晚上好",
  userName = "文远",
}) => {
  const [chatInput, setChatInput] = useState("");
  // === 新增:对话子态 ===
  // null = 欢迎屏  | { stepIndex, answers, messages } = 对话引导中
  const [onboarding, setOnboarding] = useState(null);
  const messagesEndRef = useRef(null);

  // 6 个快捷意图,3 个分组
  const intents = [
    { id: "write-new",   group: "写作", icon: Sparkles,    label: "写新手册",     desc: "AI 引导你回答关键问题",                color: "var(--lumy-l)", soft: "#F2E8FB" },
    { id: "edit-old",    group: "写作", icon: PenLine,     label: "改老手册",     desc: "选已有产品版本,AI 帮你按修改清单批改",  color: "var(--lumy-u)", soft: "#FBE5EA" },
    { id: "from-doc",    group: "写作", icon: Upload,      label: "基于文档创作", desc: "上传 PRD / 旧 datasheet / 竞品参考",   color: "var(--lumy-m)", soft: "#E5F5EC" },
    { id: "find-doc",    group: "查询", icon: FileSearch,  label: "查找文档",     desc: "已发布 / 审核中 / 草稿,自然语言筛选",   color: "var(--lumy-y)", soft: "#E2F3FB" },
    { id: "run-check",   group: "工具", icon: ClipboardCheck, label: "跑配置检查", desc: "术语 / 一致性 / 合规规则全套扫描",       color: "var(--lumy-l)", soft: "#F2E8FB" },
    { id: "review-status", group: "工具", icon: ListChecks, label: "看审批进度", desc: "我的草稿、待我审、卡在谁那里",         color: "var(--lumy-y)", soft: "#E2F3FB" },
  ];

  // 自动滚到底
  useEffect(() => {
    if (onboarding && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [onboarding?.messages?.length, onboarding?.thinking]);

  // === 启动对话引导 ===
  const startOnboarding = (presetProjectType = null) => {
    let initialMessages, initialAnswers, stepIndex;
    if (presetProjectType) {
      // 改老手册 → 跳过第 1 步,直接从第 2 步开始
      initialAnswers = { "project-type": presetProjectType };
      stepIndex = 1;
      initialMessages = [
        { role: "ai", content: <>好,<strong>{presetProjectType === "upgrade" ? "老版本升级" : presetProjectType === "custom" ? "客户定制" : "新产品"}</strong>。让我帮你把这个手册搞起来。</> },
        { role: "ai", content: ONBOARDING_STEPS[1].aiQuestion },
      ];
    } else {
      // 写新手册 → 从第 1 步开始
      initialAnswers = {};
      stepIndex = 0;
      initialMessages = [
        { role: "ai", content: <>好,我们一起做一颗新芯片。我先问你 3 个问题搞清楚情况:</> },
        { role: "ai", content: ONBOARDING_STEPS[0].aiQuestion },
      ];
    }
    setOnboarding({
      stepIndex,
      answers: initialAnswers,
      messages: initialMessages,
      thinking: false,
    });
  };

  // === 用户回答某一步 ===
  const handleStepAnswer = (value, displayLabel) => {
    if (!onboarding) return;
    const currentStep = ONBOARDING_STEPS[onboarding.stepIndex];

    // 1. 添加用户气泡
    const userBubble = { role: "user", content: displayLabel || value };

    // 2. 记录答案,准备下一步
    const newAnswers = { ...onboarding.answers, [currentStep.id]: value };

    // 3. 是否需要"AI 检索"任务卡(第 2 步)
    if (currentStep.aiSearchSimulation) {
      // 先显示用户气泡 + AI 思考
      setOnboarding({
        ...onboarding,
        answers: newAnswers,
        messages: [...onboarding.messages, userBubble],
        thinking: true,
        thinkingLabel: "AI 正在检索参考材料...",
      });
      // 800ms 后显示 task running,再 1500ms 后 task done + 下一步问题
      setTimeout(() => {
        setOnboarding(prev => ({
          ...prev,
          thinking: false,
          messages: [
            ...prev.messages,
            { kind: "task", state: "running", title: "AI 正在检索参考材料...",       detail: "扫描 PRD 库、旧 datasheet 库、竞品库" },
          ],
        }));
        setTimeout(() => {
          advanceStep(newAnswers, [
            { kind: "task", state: "done", title: "找到 7 份高相关度参考材料", detail: "PRD 2 份 · 旧 datasheet 3 份(MP1482/MP1484/MP2451)· 竞品参考 2 份(TI)" },
          ]);
        }, 1500);
      }, 800);
      return;
    }

    // 普通步骤(选项卡):用户气泡 → 思考 → 下一步问题
    setOnboarding({
      ...onboarding,
      answers: newAnswers,
      messages: [...onboarding.messages, userBubble],
      thinking: true,
      thinkingLabel: "AI 思考中...",
    });
    setTimeout(() => advanceStep(newAnswers, []), 700);
  };

  // === 推进到下一步(或完成) ===
  const advanceStep = (answers, extraTaskCards) => {
    setOnboarding(prev => {
      const nextStepIndex = prev.stepIndex + 1;
      // 把 extraTaskCards 和下一步问题塞进去
      const nextMessages = [...prev.messages, ...extraTaskCards];

      if (nextStepIndex >= ONBOARDING_STEPS.length) {
        // === 全部 3 步答完 ===
        // 加最终消息
        const finalMessages = [
          ...nextMessages,
          { kind: "task", state: "done", title: "已建立写作工程", detail: `MP1582 · v0.1-${answers["target-version"]} · 参考 MP1482 v1.2` },
          { role: "ai", content: <>好。我已分析 PRD + MP1482 datasheet + 16 章模板,<strong>主区已展示改动清单</strong> — 列出了每章需要做什么、难度多大、AI 能不能帮你。<br/><br/>你可以继续在这里跟我聊,也可以直接点主区的 <strong>「开始编辑」</strong> 进入写作。</> },
        ];
        // 1 秒后触发 onComplete 让父级切到 Working 态
        setTimeout(() => {
          onOnboardingComplete?.(answers["project-type"], answers["reference"], answers["target-version"]);
        }, 1000);
        return {
          ...prev,
          answers,
          messages: finalMessages,
          thinking: false,
          completed: true,
        };
      }

      // 下一步
      return {
        ...prev,
        stepIndex: nextStepIndex,
        answers,
        messages: [
          ...nextMessages,
          { role: "ai", content: ONBOARDING_STEPS[nextStepIndex].aiQuestion },
        ],
        thinking: false,
      };
    });
  };

  const handleFreeTextSubmit = () => {
    if (!chatInput.trim()) return;
    if (onboarding) {
      // 在引导中,作为第 2 步的答案
      const currentStep = ONBOARDING_STEPS[onboarding.stepIndex];
      if (currentStep?.inputType === "text") {
        handleStepAnswer(chatInput, chatInput);
        setChatInput("");
        return;
      }
    }
    // 不在引导中 → 自由对话(进入 freeform)
    onIntent?.("freeform", { text: chatInput });
    setChatInput("");
  };

  const handleIntentClick = (intentId) => {
    if (intentId === "write-new") {
      startOnboarding(null);  // 从第 1 步开始
      return;
    }
    if (intentId === "edit-old") {
      startOnboarding("upgrade");  // 跳过第 1 步,直接 upgrade
      return;
    }
    // 其他意图保持原行为(直接进 Working)
    onIntent?.(intentId);
  };

  // === 渲染 ===
  return (
    <div
      className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white rounded-[12px]"
      style={{ boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)" }}
    >
      {/* 顶栏 */}
      <header className="h-14 flex items-center justify-between gap-1 px-5 border-b border-[var(--border)] flex-shrink-0">
        {onboarding ? (
          <button
            onClick={() => { setOnboarding(null); setChatInput(""); }}
            className="flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={2.2} />
            <span>返回首页</span>
          </button>
        ) : <span />}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Search}>搜索</Button>
          <Button variant="ghost" size="sm" icon={History}>历史</Button>
        </div>
      </header>

      {/* === 子态 1:对话引导中 === */}
      {onboarding ? (
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[720px] mx-auto px-6 py-6">
            {/* 顶部进度条 */}
            <div className="mb-5 anim-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[var(--accent)]" strokeWidth={2.2} />
                <span className="font-display text-[14px] font-semibold text-[var(--ink)]">写作启动引导</span>
                <span className="font-mono text-[11px] text-[var(--ink-3)]">
                  · 第 {Math.min(onboarding.stepIndex + 1, ONBOARDING_STEPS.length)} / {ONBOARDING_STEPS.length} 步
                </span>
              </div>
              <div className="h-1 bg-[#F4F2FA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${Math.min((onboarding.stepIndex + (onboarding.completed ? 1 : 0)) / ONBOARDING_STEPS.length * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 消息流 */}
            <div className="space-y-3">
              {onboarding.messages.map((m, i) => {
                if (m.kind === "task") return <TaskCard key={i} state={m.state} title={m.title} detail={m.detail} />;
                if (m.role === "ai") return <AIBubble key={i}>{m.content}</AIBubble>;
                if (m.role === "user") return <UserBubble key={i}>{m.content}</UserBubble>;
                return null;
              })}
              {onboarding.thinking && <ThinkingBubble label={onboarding.thinkingLabel} />}
              <div ref={messagesEndRef} />
            </div>

            {/* === 当前步骤的输入控件 === */}
            {!onboarding.thinking && !onboarding.completed && (
              <div className="mt-5 anim-fade-up">
                <OnboardingStepInput
                  step={ONBOARDING_STEPS[onboarding.stepIndex]}
                  chatInput={chatInput}
                  onChatInput={setChatInput}
                  onSelect={(value, label) => handleStepAnswer(value, label)}
                  onTextSubmit={handleFreeTextSubmit}
                />
              </div>
            )}

            {onboarding.completed && (
              <div className="mt-6 px-4 py-3 bg-[rgba(46,139,90,0.08)] border border-[var(--success)]/30 rounded-[10px] flex items-center gap-2.5 anim-fade-up">
                <CheckCircle2 size={16} className="text-[var(--success)] flex-shrink-0" />
                <span className="text-[13px] text-[var(--ink-2)]">引导完成,正在为你打开改动清单...</span>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* === 子态 2:欢迎屏(原有) === */
        <main className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto scrollbar-thin">
          <div className="w-full max-w-[720px]">
            {/* 问候 */}
            <div className="text-center mb-7 anim-fade-up">
              <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.18em] uppercase mb-2.5 flex items-center justify-center gap-1.5">
                <span>Datapilot</span>
                <span className="text-[var(--ink-4)]">·</span>
                <span>powered by</span>
                <LumyBrand size={11} />
              </div>
              <h1 className="font-display text-[40px] leading-[1.05] text-[var(--ink)] font-normal tracking-[-0.02em] mb-2">
                {greeting},<span style={{ fontStyle: "italic", color: "var(--accent)" }}>{userName}</span>。
              </h1>
              <p className="text-[14px] text-[var(--ink-2)] leading-[1.5]">
                告诉我你想做什么 — 写新手册、改老的、查文档、跑检查...
              </p>
            </div>

            {/* 大型对话输入框 */}
            <div className="anim-fade-up" style={{ animationDelay: "100ms" }}>
              <ChatInput
                value={chatInput}
                onChange={setChatInput}
                onSubmit={handleFreeTextSubmit}
                placeholder="问 AI 任何问题,例:找 Buck 类、量产的产品 / TPS54824 vs LM5117 / 3A 输出选什么电感"
                autoFocus
                size="lg"
              />
            </div>

            {/* 6 张快捷意图卡 — 3x2 */}
            <div className="mt-6 anim-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-2.5 px-1 flex items-center gap-2">
                <span>或者直接选一个</span>
                <span className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {intents.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.id}
                      onClick={() => handleIntentClick(it.id)}
                      className="group bg-white border border-[var(--border)] rounded-[12px] px-3.5 py-3 text-left transition-all hover:border-[var(--accent)] hover:shadow-[0_2px_8px_rgba(24,20,38,0.06)] anim-fade-up"
                      style={{ animationDelay: `${i * 40 + 250}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: it.soft }}
                        >
                          <Icon size={13} style={{ color: it.color }} strokeWidth={2.2} />
                        </div>
                        <span className="font-display font-semibold text-[14px] text-[var(--ink)] leading-tight">
                          {it.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-2)] leading-[1.5]">
                        {it.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 底栏 */}
      <footer className="h-12 px-5 flex items-center justify-between text-[11px] text-[var(--ink-3)] font-mono border-t border-[var(--border)] flex-shrink-0">
        <span>v0.6.0-alpha</span>
        <span>按 [ 收起侧栏 · ⌘N 新对话</span>
      </footer>
    </div>
  );
};

// 启动引导步骤的输入控件 — 选项卡 or 自由文本
const OnboardingStepInput = ({ step, chatInput, onChatInput, onSelect, onTextSubmit }) => {
  if (!step) return null;

  if (step.inputType === "options") {
    return (
      <div className="space-y-2">
        <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-1">请选择</div>
        <div className={step.options.length <= 3 ? "grid grid-cols-3 gap-2" : "grid grid-cols-5 gap-2"}>
          {step.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value, opt.label)}
              className="group bg-white border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/30 hover:shadow-[0_2px_8px_rgba(24,20,38,0.06)]"
            >
              <div className="font-display text-[13px] font-semibold text-[var(--ink)] mb-0.5 group-hover:text-[var(--accent-ink)]">
                {opt.label}
              </div>
              <div className="text-[11px] text-[var(--ink-3)] leading-snug">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step.inputType === "text") {
    return (
      <ChatInput
        value={chatInput}
        onChange={onChatInput}
        onSubmit={onTextSubmit}
        placeholder={step.placeholder || "输入你的回答..."}
        autoFocus
      />
    );
  }

  return null;
};

// ============================================================
// 9. WorkingScreen — 工作态
//    - LeftSidebar 常驻
//    - 主区(根据意图变化:doc-edit / doc-list / report)
//    - 右侧 AI 对话窗(可收起到右下角 FAB)
// ============================================================
const WorkingScreen = ({
  intentType,    // doc-edit | doc-list | report | change-plan | version-tree
  intentPayload, // 跟意图相关的数据
  messages,
  thinking,
  thinkingLabel,
  inputValue,
  onInputChange,
  onSubmit,
  onBackToIdle,
  onEnterEdit,
  chatRatio = 0.5,         // 对话区占比(0-1)
  onChatRatioChange,
}) => {
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // ⌘L 唤起/收起对话区
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setChatCollapsed(c => !c);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 拖拽逻辑:鼠标按下 → 监听 mousemove 计算新比例
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // 鼠标 x 相对容器左边的位置
      const offsetX = e.clientX - rect.left;
      // 新对话区占比
      let newRatio = offsetX / rect.width;
      // 限制最小最大(对话区不少于 25%,不多于 75%)
      newRatio = Math.max(0.25, Math.min(0.75, newRatio));
      onChatRatioChange?.(newRatio);
    };
    const onUp = () => setDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onChatRatioChange]);

  // 主区根据意图渲染
  const mainContent = (() => {
    switch (intentType) {
      case "doc-edit":        return <DocEditMain payload={intentPayload} />;
      case "doc-list":        return <DocListMain payload={intentPayload} />;
      case "report":          return <ReportMain payload={intentPayload} />;
      case "change-plan":     return <ChangePlanMain payload={intentPayload} onEnterEdit={onEnterEdit} />;
      case "review-inbox":    return <ReviewInboxMain payload={intentPayload} />;
      case "publish-inbox":   return <PublishInboxMain payload={intentPayload} />;
      case "review-history":  return <ReviewHistoryMain />;
      case "publish-history": return <PublishHistoryMain />;
      case "writing-doing":   return <WritingDoingMain />;
      case "platform":        return <PlatformMain />;
      case "templates":       return <TemplatesMain />;
      default:             return <DocEditMain payload={intentPayload} />;
    }
  })();

  // 计算两栏百分比(对话区收起时主区占满,但留 40px 给展开条)
  const chatPct = chatCollapsed ? 0 : Math.round(chatRatio * 100);
  const mainPct = chatCollapsed ? 100 : 100 - chatPct;

  return (
    <div ref={containerRef} className="flex-1 flex min-w-0 gap-2 relative">
      {/* 收起态:左侧留 40px 展开条 */}
      {chatCollapsed && (
        <button
          onClick={() => setChatCollapsed(false)}
          title="展开对话区 ⌘L"
          className="flex-shrink-0 flex flex-col items-center justify-start py-3 gap-2 bg-white rounded-[12px] hover:bg-[#FAFAFE] transition-colors group"
          style={{
            width: 40,
            boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)",
          }}
        >
          <Logo size={22} />
          <PanelLeftOpen size={14} strokeWidth={2.2} className="text-[var(--ink-3)] group-hover:text-[var(--accent)] transition-colors" />
          {/* 竖向"AI 对话"文字 */}
          <span
            className="font-display text-[11px] text-[var(--ink-3)] group-hover:text-[var(--accent)] mt-1"
            style={{ writingMode: "vertical-rl" }}
          >
            AI 对话
          </span>
        </button>
      )}

      {/* 左:AI 对话窗(可向左收起) */}
      {!chatCollapsed && (
        <div
          className="flex flex-col overflow-hidden bg-white rounded-[12px] anim-slide-in-left"
          style={{
            width: `calc(${chatPct}% - 4px)`,  // 减半个 gap
            minWidth: 0,
            boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)",
          }}
        >
          {/* 对话窗顶栏 */}
          <div className="h-14 px-4 border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Logo size={22} />
              <span className="font-display font-semibold text-[14px] text-[var(--ink)] truncate">
                AI 对话
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" icon={MessageSquarePlus} onClick={onBackToIdle}>新对话</Button>
              <IconButton icon={PanelLeftClose} onClick={() => setChatCollapsed(true)} title="收起对话区 ⌘L" size="sm" />
            </div>
          </div>

          {/* 对话主体 */}
          <ChatPanel
            messages={messages}
            thinking={thinking}
            thinkingLabel={thinkingLabel}
            inputValue={inputValue}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            inputPlaceholder="继续和 AI 对话..."
            inputSize="md"
          />
        </div>
      )}

      {/* 右:写作区/主区 — 一直显示 */}
      <aside
        className="bg-white rounded-[12px] flex flex-col flex-1"
        style={{
          minWidth: 0,
          boxShadow: "0 1px 3px rgba(24,20,38,0.06), 0 4px 12px rgba(24,20,38,0.04)",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden rounded-[12px]">
          {mainContent}
        </div>
      </aside>

      {/* 拖拽条 — 浮在两栏中间的 gap 上,位置由 chatPct 决定 */}
      {!chatCollapsed && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${chatPct}% - 8px)`,  // 拖拽条中心对齐缝隙中线
            width: 16,
            cursor: "col-resize",
            zIndex: 50,
            touchAction: "none",
          }}
          className="group"
        >
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full transition-colors"
            style={{
              background: dragging ? "var(--accent)" : "transparent",
            }}
          />
          {/* hover 状态下显示淡灰色 */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: dragging ? "transparent" : "var(--border-strong)",
            }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================
// 10. DocEditMain — 文档微调主区(三段式:左 ToC + 中正文 + 右字段卡)
// ============================================================
// ============================================================
// MP1482 → MP1582 真实案例数据
//   MP1482 是 MPS 真实产品(2A 18V 同步整流 buck,340kHz)
//   MP1582 是基于 MP1482 升级的新产品(3A 20V 同步整流 buck,600kHz,加 PG)
// ============================================================

// MP1582 工程信息
const MP1582_PROJECT = {
  newProduct: "MP1582",
  basedOn: "MP1482",
  refTitle: "MP1482 v1.2 (MPS, 2A 18V Buck)",
  refSpecs: {
    vin: "4.75V – 18V",
    vout: "0.923V – 15V",
    iout: "2A",
    freq: "340 kHz",
    rdson: "130 mΩ × 2",
    eff: "93%",
    pkg: "SOIC8 / SOIC8E",
    pins: 8,
  },
  newSpecs: {
    vin: "4.5V – 20V",
    vout: "0.6V – 17V",
    iout: "3A",
    freq: "600 kHz",
    rdson: "100 mΩ × 2",
    eff: "95%",
    pkg: "SOIC8E / QFN-3x3",
    pins: 9, // 加 PG
  },
};

// MP1482 真实电气参数(摘自 datasheet 第 3 页 ELECTRICAL CHARACTERISTICS)
// 用于 MP1582 改动清单的对比
const MP1482_ELEC_TABLE = [
  { param: "Shutdown Supply Current",  symbol: "—",       cond: "VEN = 0V",                 min: "—",     typ: "1",     max: "3.0",   unit: "μA"  },
  { param: "Supply Current",           symbol: "—",       cond: "VEN = 2.0V; VFB = 1.0V",   min: "—",     typ: "1.3",   max: "1.5",   unit: "mA"  },
  { param: "Feedback Voltage",         symbol: "VFB",     cond: "4.75V ≤ VIN ≤ 18V",        min: "0.900", typ: "0.923", max: "0.946", unit: "V"   },
  { param: "Feedback Overvoltage Th",  symbol: "—",       cond: "—",                        min: "—",     typ: "1.1",   max: "—",     unit: "V"   },
  { param: "High-Side Switch RDS(ON)", symbol: "RDSON1",  cond: "—",                        min: "—",     typ: "130",   max: "—",     unit: "mΩ"  },
  { param: "Low-Side Switch RDS(ON)",  symbol: "RDSON2",  cond: "—",                        min: "—",     typ: "130",   max: "—",     unit: "mΩ"  },
  { param: "Upper Switch Current Limit", symbol: "—",     cond: "Min Duty Cycle",           min: "2.4",   typ: "—",     max: "3.4",   unit: "A"   },
  { param: "Lower Switch Current Limit", symbol: "—",     cond: "From Drain to Source",     min: "—",     typ: "1.1",   max: "—",     unit: "A"   },
  { param: "Oscillation Frequency",    symbol: "Fosc1",   cond: "—",                        min: "305",   typ: "340",   max: "375",   unit: "kHz" },
  { param: "Maximum Duty Cycle",       symbol: "DMAX",    cond: "VFB = 1.0V",               min: "—",     typ: "—",     max: "90",    unit: "%"   },
  { param: "Minimum On Time",          symbol: "—",       cond: "Guaranteed by design",     min: "—",     typ: "220",   max: "—",     unit: "ns"  },
  { param: "EN Shutdown Threshold",    symbol: "VEN",     cond: "Rising",                   min: "1.1",   typ: "1.5",   max: "2.0",   unit: "V"   },
  { param: "Input UVLO Threshold",     symbol: "—",       cond: "VIN Rising",               min: "3.80",  typ: "4.10",  max: "4.40",  unit: "V"   },
  { param: "Soft-Start Current",       symbol: "—",       cond: "VSS = 0V",                 min: "—",     typ: "6",     max: "—",     unit: "μA"  },
  { param: "Soft-Start Period",        symbol: "—",       cond: "CSS = 0.1μF",              min: "—",     typ: "15",    max: "—",     unit: "ms"  },
  { param: "Thermal Shutdown",         symbol: "—",       cond: "Guaranteed by design",     min: "—",     typ: "160",   max: "—",     unit: "°C"  },
];

// MP1582 目标电气参数(改动后)— 用于在 ElectricTable 里高亮 diff
const MP1582_ELEC_TABLE = [
  { param: "Shutdown Supply Current",  symbol: "—",       cond: "VEN = 0V",                 min: "—",     typ: "0.8",   max: "2.0",   unit: "μA",  changed: true },
  { param: "Supply Current",           symbol: "—",       cond: "VEN = 2.0V; VFB = 0.6V",   min: "—",     typ: "1.5",   max: "1.8",   unit: "mA",  changed: true },
  { param: "Feedback Voltage",         symbol: "VFB",     cond: "4.5V ≤ VIN ≤ 20V",         min: "0.591", typ: "0.600", max: "0.609", unit: "V",   changed: true },
  { param: "Feedback Overvoltage Th",  symbol: "—",       cond: "—",                        min: "—",     typ: "0.72",  max: "—",     unit: "V",   changed: true },
  { param: "High-Side Switch RDS(ON)", symbol: "RDSON1",  cond: "—",                        min: "—",     typ: "100",   max: "—",     unit: "mΩ",  changed: true },
  { param: "Low-Side Switch RDS(ON)",  symbol: "RDSON2",  cond: "—",                        min: "—",     typ: "100",   max: "—",     unit: "mΩ",  changed: true },
  { param: "Upper Switch Current Limit", symbol: "—",     cond: "Min Duty Cycle",           min: "3.5",   typ: "—",     max: "4.5",   unit: "A",   changed: true },
  { param: "Lower Switch Current Limit", symbol: "—",     cond: "From Drain to Source",     min: "—",     typ: "1.5",   max: "—",     unit: "A",   changed: true },
  { param: "Oscillation Frequency",    symbol: "Fosc1",   cond: "—",                        min: "550",   typ: "600",   max: "650",   unit: "kHz", changed: true },
  { param: "Maximum Duty Cycle",       symbol: "DMAX",    cond: "VFB = 0.6V",               min: "—",     typ: "—",     max: "92",    unit: "%",   changed: true },
  { param: "Minimum On Time",          symbol: "—",       cond: "Guaranteed by design",     min: "—",     typ: "120",   max: "—",     unit: "ns",  changed: true },
  { param: "EN Shutdown Threshold",    symbol: "VEN",     cond: "Rising",                   min: "1.1",   typ: "1.5",   max: "2.0",   unit: "V"  },
  { param: "Input UVLO Threshold",     symbol: "—",       cond: "VIN Rising",               min: "3.80",  typ: "4.10",  max: "4.40",  unit: "V"  },
  { param: "Soft-Start Current",       symbol: "—",       cond: "VSS = 0V",                 min: "—",     typ: "6",     max: "—",     unit: "μA" },
  { param: "Soft-Start Period",        symbol: "—",       cond: "CSS = 0.1μF",              min: "—",     typ: "8",     max: "—",     unit: "ms",  changed: true },
  { param: "PG Threshold (rising)",    symbol: "VPG",     cond: "VFB rising",               min: "0.55",  typ: "0.57",  max: "0.59",  unit: "V",   added: true },
  { param: "PG Output Low Voltage",    symbol: "VOL_PG",  cond: "IPG = 4 mA",               min: "—",     typ: "—",     max: "0.4",   unit: "V",   added: true },
  { param: "Thermal Shutdown",         symbol: "—",       cond: "Guaranteed by design",     min: "—",     typ: "160",   max: "—",     unit: "°C" },
];

// MP1482 真实引脚定义(8 pin)
const MP1482_PINS = [
  { num: "1",  name: "BS",   desc: "High-Side Gate Drive Boost Input. 接 0.01μF 以上的电容到 SW" },
  { num: "2",  name: "IN",   desc: "Power Input. 4.75V – 18V" },
  { num: "3",  name: "SW",   desc: "Power Switching Output. 接 LC 滤波" },
  { num: "4",  name: "GND",  desc: "Ground" },
  { num: "5",  name: "FB",   desc: "Feedback Input. 阈值 0.923V" },
  { num: "6",  name: "COMP", desc: "Compensation Node. 接 RC 网络" },
  { num: "7",  name: "EN",   desc: "Enable Input. 100kΩ 上拉自动启动" },
  { num: "8",  name: "SS",   desc: "Soft-Start Control. CSS = 0.1μF 设定 15ms 软启动" },
];

// MP1582 引脚定义(9 pin,加 PG)
const MP1582_PINS = [
  { num: "1",  name: "BS",   desc: "High-Side Gate Drive Boost Input" },
  { num: "2",  name: "IN",   desc: "Power Input. 4.5V – 20V (上限提升 +2V)", changed: true },
  { num: "3",  name: "SW",   desc: "Power Switching Output" },
  { num: "4",  name: "GND",  desc: "Ground" },
  { num: "5",  name: "FB",   desc: "Feedback Input. 阈值 0.600V (降低,支持更低 VOUT)", changed: true },
  { num: "6",  name: "COMP", desc: "Compensation Node" },
  { num: "7",  name: "EN",   desc: "Enable Input" },
  { num: "8",  name: "SS",   desc: "Soft-Start Control" },
  { num: "9",  name: "PG",   desc: "Power Good Output (新增,开漏输出,VFB 达 95% 时拉高)", added: true },
];

// 16 章节真实内容(MP1582 改自 MP1482)
// 每节的 originalText(MP1482 原文)和 newText(MP1582 改后)用于对比展示
const CHAPTERS_DATA = {
  title: {
    originalText: "MP1482\n2A, 18V Synchronous Rectified Step-Down Converter",
    newText: "MP1582\n3A, 20V Synchronous Rectified Step-Down Converter",
    diff: "PPN MP1482 → MP1582,IOUT 2A → 3A,VIN_max 18V → 20V",
  },
  features: {
    originalText: "• 2A Output Current\n• Wide 4.75V to 18V Operating Input Range\n• Integrated 130mΩ Power MOSFET Switches\n• Output Adjustable from 0.923V to 15V\n• Up to 93% Efficiency\n• Programmable Soft-Start\n• Stable with Low ESR Ceramic Output Capacitors\n• Fixed 340kHz Frequency\n• Cycle-by-Cycle Over Current Protection\n• Input Under Voltage Lockout\n• 8-Pin SOIC",
    newText: "• 3A Output Current\n• Wide 4.5V to 20V Operating Input Range\n• Integrated 100mΩ Power MOSFET Switches\n• Output Adjustable from 0.6V to 17V\n• Up to 95% Efficiency\n• Programmable Soft-Start\n• Power Good (PG) Indicator\n• Stable with Low ESR Ceramic Output Capacitors\n• Fixed 600kHz Frequency\n• Cycle-by-Cycle Over Current Protection\n• Input Under Voltage Lockout\n• 9-Pin SOIC8E / 3x3 QFN-9",
    diff: "IOUT 2A → 3A,RDS(ON) 130 → 100mΩ,VOUT 下限 0.923V → 0.6V,频率 340 → 600kHz,效率 93 → 95%,新增 PG 引脚",
  },
  description: {
    originalText: "The MP1482 is a monolithic synchronous buck regulator. The device integrates two 130mΩ MOSFETs, and provides 2A of continuous load current over a wide input voltage of 4.75V to 18V. Current mode control provides fast transient response and cycle-by-cycle current limit.\n\nAn adjustable soft-start prevents inrush current at turn-on, and in shutdown mode the supply current drops to 1μA.\n\nThis device, available in an 8-pin SOIC package, provides a very compact solution with minimal external components.",
    newText: "The MP1582 is a monolithic synchronous buck regulator with Power Good indication. The device integrates two 100mΩ MOSFETs, and provides 3A of continuous load current over a wide input voltage of 4.5V to 20V. Current mode control with 600kHz fixed switching frequency enables smaller external inductors and faster transient response.\n\nA dedicated PG (Power Good) pin signals the host when the output voltage reaches 95% of the regulation target, simplifying power sequencing for FPGA and MCU loads.\n\nAn adjustable soft-start prevents inrush current at turn-on, and in shutdown mode the supply current drops to below 1μA.\n\nAvailable in 9-pin SOIC8E with exposed pad and 3x3 QFN-9 packages, MP1582 provides a compact solution with minimal external components.",
    diff: "重写突出 PG 引脚 + 600kHz + 95% 效率 + 升级 IOUT,功能原理软描述需把握深浅尺度",
  },
  applications: {
    originalText: "• Distributed Power Systems\n• Networking Systems\n• FPGA, DSP, ASIC Power Supplies\n• Green Electronics / Appliances\n• Notebook Computers",
    newText: "• Distributed Power Systems\n• Networking Systems & 5G Equipment\n• FPGA / DSP / ASIC / SoC Power Supplies\n• Solid State Drives (SSD)\n• Industrial Automation\n• Notebook & Tablet Computers",
    diff: "拓展应用场景:加 5G 设备 / SSD / 工业自动化",
  },
  electrical: {
    originalText: "见 MP1482 datasheet 第 3 页 ELECTRICAL CHARACTERISTICS 表(共 16 行)",
    newText: "全表更新:VFB 0.923V → 0.600V,RDSON 130mΩ → 100mΩ,频率 340kHz → 600kHz,IOUT 上限 2.4-3.4A → 3.5-4.5A,新增 PG 阈值 + PG VOL",
    diff: "全表更新 + 增加 2 行 PG 项 + 等量产数据回填",
  },
  function: {
    originalText: "The MP1482 uses current-mode control to regulate the output voltage. The output voltage is measured at FB through a resistive voltage divider and amplified through the internal transconductance error amplifier. The voltage at the COMP pin is compared to the switch current measured internally to control the output voltage.",
    newText: "MP1582 在 MP1482 的电流模式控制基础上,新增了 Power Good 监测电路。当 VFB 上升到目标值的 95%(典型 0.57V)时,内部比较器拉高 PG 引脚,通知主控芯片(FPGA/MCU)电源已就绪。\n\n[功能原理软描述 - 站在客户视角:为什么这对您的设计有用]\n\n传统 buck 设计需要外部电压检测电路才能实现电源时序,占用 2-3 个 GPIO 和外部 RC 网络。MP1582 内置 PG 让您只需一根线就能驱动 FPGA 的 RESET_N 或 MCU 的 PWR_GOOD,典型应用可省 4 个外围器件。",
    diff: "新增 PG 章节,客户视角描述:省外围 / 简化时序",
  },
};

// ============================================================
// 写作中心 — 章节级 schema(批次 3)
// ============================================================

// 章节状态 4 态 + 视觉规范
//   empty       未开始
//   in-progress 进行中
//   done        已完成
//   warn        需复核(自查不合格 / 审核被拒回)
const CHAPTER_STATUS = {
  empty:         { label: "空白",   bg: "#F4F2FA", ink: "#9B95A8", dot: "#C9C2DD" },
  "in-progress": { label: "写作中", bg: "#E8E2FF", ink: "#3A23B0", dot: "#5847CC" },
  done:          { label: "已完成", bg: "#E5F5EC", ink: "#166534", dot: "#2E8B5A" },
  warn:          { label: "需复核", bg: "#FCEFCB", ink: "#92400E", dot: "#D89020" },
};
// 状态循环顺序(章节顶部 badge 点击切换用)
const CHAPTER_STATUS_CYCLE = ["empty", "in-progress", "done", "warn"];

// 默认 16 章模板(所有 doc 都基于这个骨架)
const DEFAULT_CHAPTERS = [
  { id: "title",        num: "1",  name: "标题",         type: "text" },
  { id: "features",     num: "2",  name: "特点",         type: "text" },
  { id: "description",  num: "3",  name: "描述",         type: "text" },
  { id: "applications", num: "4",  name: "典型应用",     type: "text" },
  { id: "circuit",      num: "5",  name: "应用电路",     type: "image" },
  { id: "package",      num: "6",  name: "封装信息",     type: "image" },
  { id: "absmax",       num: "7",  name: "极限参数",     type: "table" },
  { id: "recommended",  num: "8",  name: "推荐参数",     type: "table" },
  { id: "electrical",   num: "9",  name: "电气参数",     type: "table" },
  { id: "curves",       num: "10", name: "曲线性能图",   type: "image" },
  { id: "function",     num: "11", name: "功能介绍",     type: "text" },
  { id: "appguide",     num: "12", name: "应用指南",     type: "text" },
  { id: "pcb",          num: "13", name: "PCB 应用指南", type: "image" },
  { id: "ordering",     num: "14", name: "订购信息",     type: "table" },
  { id: "pod",          num: "15", name: "POD 图纸",     type: "image" },
  { id: "disclaimer",   num: "16", name: "免责声明",     type: "text" },
];

// 重点 demo 文档完整 mock(覆盖默认状态生成器)
// 没在这里的 ppn 由 buildDefaultChapterState 按 reviewState 自动生成
const DOC_DETAILS = {
  "MP1582": {
    note: "MP1582 是 MP1482 的升级版,重点突出 PG 引脚和 600kHz 频率优势。等量产实测数据回填后即可送审。",
    chapters: {
      title:        { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 14:20", note: "PPN 已确认 MP1582" },
      features:     { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 15:10", note: "已加 PG 引脚 feature" },
      description:  { status: "in-progress", lastModifier: "张文远", lastModifiedAt: "5 月 4 日 10:30", note: "正在重写 PG + 600kHz 段落" },
      applications: { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 16:00", note: "增加 5G / SSD 应用" },
      circuit:      { status: "done",        lastModifier: "陈悦",   lastModifiedAt: "5 月 2 日 11:00", note: "标准应用图沿用 MP1482" },
      package:      { status: "empty",       lastModifier: null,    lastModifiedAt: null,           note: "等封装最终定型(SOIC8E + QFN-9)" },
      absmax:       { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 13:00", note: null },
      recommended:  { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 13:15", note: null },
      electrical:   { status: "warn",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 17:30", note: "PG 阈值数据等量产实测回填" },
      curves:       { status: "warn",        lastModifier: null,    lastModifiedAt: null,           note: "等实测效率/负载瞬态曲线" },
      function:     { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 4 日 09:00", note: "已写 PG 软描述(客户视角)" },
      appguide:     { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 18:00", note: null },
      pcb:          { status: "done",        lastModifier: "陈悦",   lastModifiedAt: "5 月 2 日 14:30", note: "PCB layout 沿用 MP1482" },
      ordering:     { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 11:00", note: null },
      pod:          { status: "warn",        lastModifier: null,    lastModifiedAt: null,           note: "需要 SOIC8E + QFN-9 两版 POD" },
      disclaimer:   { status: "done",        lastModifier: "张文远", lastModifiedAt: "5 月 3 日 10:00", note: null },
    },
  },
  "TPS54824": {
    note: "TPS54824 v0.1 — 8A 28V 同步降压(集成 FET),已提交陈悦审核。",
    chapters: {
      title:        { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 10:00", note: null },
      features:     { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 11:30", note: null },
      description:  { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 09:00", note: null },
      applications: { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 14:00", note: null },
      circuit:      { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 11:00", note: null },
      package:      { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 15:30", note: "HTSSOP-20 已确定" },
      absmax:       { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 16:00", note: null },
      recommended:  { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 16:15", note: null },
      electrical:   { status: "warn", lastModifier: "张文远", lastModifiedAt: "5 月 3 日 09:00", note: "陈悦反馈:bode 图相位裕度数据需补" },
      curves:       { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 17:00", note: null },
      function:     { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 3 日 10:30", note: null },
      appguide:     { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 18:00", note: null },
      pcb:          { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 3 日 11:30", note: null },
      ordering:     { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 2 日 12:00", note: null },
      pod:          { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 3 日 13:00", note: null },
      disclaimer:   { status: "done", lastModifier: "张文远", lastModifiedAt: "5 月 1 日 09:30", note: null },
    },
  },
};

// 按 reviewState 给出每章的默认状态(没在 DOC_DETAILS 里的 ppn 用这个)
function buildDefaultChapterState(reviewState, chapterId) {
  if (reviewState === "approved") return "done";
  if (reviewState === "review") {
    return ["electrical", "curves", "pod"].includes(chapterId) ? "warn" : "done";
  }
  if (reviewState === "rejected") {
    return ["electrical", "function", "curves"].includes(chapterId) ? "warn" : "done";
  }
  // draft:基础章节已写,描述/应用/功能进行中,图片/曲线为空
  if (["title", "features", "absmax", "recommended", "ordering", "disclaimer"].includes(chapterId)) return "done";
  if (["description", "applications", "function"].includes(chapterId)) return "in-progress";
  return "empty";
}

// 取一个 doc 的完整章节详情(供 DocEditMain / WritingDoingMain 共用)
//
// 章节字段说明:
//   status / lastModifier / lastModifiedAt — 状态 + 最后修改信息
//   note      — 最新备注的文本(向后兼容字段;UI 多处用它做"一行预览")
//   notes[]   — 备注完整列表(每条:id / author / atMs / text);最新一条放在 [0]
function getDocDetails(product) {
  const ppn = typeof product === "string" ? product : product?.ppn;
  const reviewState = (typeof product === "object" && product?.reviewState) || "draft";
  const detailMock = ppn ? DOC_DETAILS[ppn] : null;

  const chapters = DEFAULT_CHAPTERS.map(ch => {
    const detail = detailMock?.chapters?.[ch.id];
    if (detail) {
      // 把 mock 里的单条 note 转成 notes[] —— mock 简洁,UI 层得到完整结构
      const notes = detail.note
        ? [{
            id: `${ch.id}-note-1`,
            author: detail.lastModifier || "—",
            atMs: Date.now(),
            text: detail.note,
          }]
        : [];
      return { ...ch, ...detail, notes };
    }
    return {
      ...ch,
      status: buildDefaultChapterState(reviewState, ch.id),
      lastModifier: null,
      lastModifiedAt: null,
      note: null,
      notes: [],
    };
  });

  return {
    note: detailMock?.note || null,
    chapters,
  };
}

// 进度统计 — 4 状态 + 完成度百分比
function computeChapterProgress(chapters) {
  const total = chapters.length;
  const done = chapters.filter(ch => ch.status === "done").length;
  const inProgress = chapters.filter(ch => ch.status === "in-progress").length;
  const warn = chapters.filter(ch => ch.status === "warn").length;
  const empty = chapters.filter(ch => ch.status === "empty").length;
  return {
    total, done, inProgress, warn, empty,
    percent: total > 0 ? Math.round(done / total * 100) : 0,
  };
}

// 取最新修改信息(用于卡片底部「最后修改 XX · X 时间」)
// 字符串排序("5 月 X 日 HH:MM" 在 5 月内、或同 X 月内有效;跨月需要进一步处理,demo 阶段足够)
function getLastModified(chapters) {
  const withTime = chapters.filter(ch => ch.lastModifiedAt && ch.lastModifier);
  if (withTime.length === 0) return null;
  withTime.sort((a, b) => (b.lastModifiedAt || "").localeCompare(a.lastModifiedAt || ""));
  return { modifier: withTime[0].lastModifier, at: withTime[0].lastModifiedAt };
}

// 写新手册启动引导 — 3 步问答(混合按钮 + 自由文本)
const ONBOARDING_STEPS = [
  {
    id: "project-type",
    aiQuestion: <><strong>第 1 步:工程类型?</strong><br/><span className="text-[12px] text-[var(--ink-2)]">绝大多数手册其实都有参考对象,纯白手册很少。</span></>,
    inputType: "options",
    options: [
      { value: "new",     label: "新产品第一版", desc: "基于 PRD 起草" },
      { value: "upgrade", label: "老版本升级",   desc: "在上一版基础上改" },
      { value: "custom",  label: "客户定制",     desc: "基于正式版派生专版" },
    ],
  },
  {
    id: "reference",
    aiQuestion: <><strong>第 2 步:参考材料?</strong><br/><span className="text-[12px] text-[var(--ink-2)]">告诉我新产品的主要功能,我从 PRD 库 / 旧 datasheet / 竞品库帮你找。</span><br/><span className="text-[11px] text-[var(--ink-3)] italic">例:Buck 转换器,3A,VIN 4.5-20V,带 PG,600kHz</span></>,
    inputType: "text",
    placeholder: "用一句话描述新产品的主要功能...",
    aiSearchSimulation: true, // 提交后模拟检索动画
  },
  {
    id: "target-version",
    aiQuestion: <>主区已展示 AI 找到的参考材料。最相关的是 <strong>「MP1482 v1.2」</strong>(96% 匹配,作为升级基础)。<br/><br/><strong>第 3 步:目标版本?</strong><br/>5 种状态:第一稿建议从 <strong>draft 初始版</strong> 开始。</>,
    inputType: "options",
    options: [
      { value: "draft",  label: "draft",  desc: "初始版 · 撰写中" },
      { value: "alpha",  label: "alpha",  desc: "送样版 · 跟样片给销售/AE" },
      { value: "beta",   label: "beta",   desc: "小批版 · 关键客户预览" },
      { value: "ga",     label: "GA",     desc: "正式版 · 公开发布" },
      { value: "custom", label: "custom", desc: "客户专版 · 基于 GA 派生" },
    ],
  },
];

// ============================================================
// ChapterContent — 章节内容渲染器
//   根据章节 type (text/table/image) 显示真实 MP1582 内容
// ============================================================
const ChapterContent = ({ chapter, chapterData, elecTable, originalElecTable, pins, originalPins, project }) => {
  if (!chapter) return null;

  const chTitle = (
    <>
      <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-2">第 {chapter.num} 节</div>
      <h1 className="font-display text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--ink)] mb-1">
        {chapter.name}
      </h1>
      {chapterData?.diff && (
        <div className="bg-[var(--accent-soft)]/40 border-l-2 border-[var(--accent)] pl-3 py-2 mb-5 text-[12px] text-[var(--accent-ink)] leading-snug">
          <span className="font-medium">改动:</span> {chapterData.diff}
        </div>
      )}
    </>
  );

  // 文本章节(标题/特点/描述/典型应用/功能介绍/应用指南/免责声明)
  if (chapter.type === "text") {
    if (chapter.id === "title") {
      return (
        <>
          {chTitle}
          <div className="bg-[#F4F2FA] border border-[var(--border)] rounded-[12px] p-6 mb-5">
            <div className="font-display text-[40px] font-semibold text-[var(--ink)] leading-tight mb-2">
              <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-2 rounded">MP1582</span>
            </div>
            <div className="font-display text-[18px] text-[var(--ink-2)] leading-snug">
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1.5 rounded font-mono">3A</span>{", "}
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1.5 rounded font-mono">20V</span>{" "}Synchronous Rectified Step-Down Converter
            </div>
          </div>
          <div className="text-[12px] text-[var(--ink-3)] leading-relaxed">
            <strong>原版(MP1482):</strong> 2A, 18V Synchronous Rectified Step-Down Converter<br/>
            <strong>本版(MP1582):</strong> 升级 IOUT 到 3A,VIN 上限提高到 20V
          </div>
        </>
      );
    }
    if (chapter.id === "features") {
      return (
        <>
          {chTitle}
          <ul className="text-[14px] text-[var(--ink)] leading-[1.85] space-y-1">
            <li>• <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">3A</span> Output Current</li>
            <li>• Wide <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">4.5V to 20V</span> Operating Input Range</li>
            <li>• Integrated <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">100mΩ</span> Power MOSFET Switches</li>
            <li>• Output Adjustable from <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">0.6V to 17V</span></li>
            <li>• Up to <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">95%</span> Efficiency</li>
            <li>• Programmable Soft-Start</li>
            <li className="text-[var(--success)]">• <strong>Power Good (PG) Indicator</strong> <span className="text-[11px] font-mono">[新增]</span></li>
            <li>• Stable with Low ESR Ceramic Output Capacitors</li>
            <li>• Fixed <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">600kHz</span> Frequency</li>
            <li>• Cycle-by-Cycle Over Current Protection</li>
            <li>• Input Under Voltage Lockout</li>
            <li>• 9-Pin SOIC8E / 3x3 QFN-9</li>
          </ul>
        </>
      );
    }
    if (chapter.id === "description") {
      return (
        <>
          {chTitle}
          <div className="text-[14px] text-[var(--ink)] leading-[1.85]">
            <p className="mb-4">
              The <span className="font-mono text-[13px] bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded font-semibold">MP1582</span> is a monolithic synchronous buck regulator with{" "}
              <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded font-semibold">Power Good indication</span>. The device integrates two{" "}
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">100mΩ</span> MOSFETs, and provides{" "}
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">3A</span> of continuous load current over a wide input voltage of{" "}
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">4.5V to 20V</span>. Current mode control with{" "}
              <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] px-1 rounded font-mono text-[13px]">600kHz</span> fixed switching frequency enables smaller external inductors and faster transient response.
            </p>
            <p className="mb-4">
              A dedicated <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded font-semibold">PG (Power Good)</span> pin signals the host when the output voltage reaches 95% of the regulation target, simplifying power sequencing for FPGA and MCU loads.
            </p>
            <p className="mb-4">
              An adjustable soft-start prevents inrush current at turn-on, and in shutdown mode the supply current drops to below 1μA.
            </p>
            <p>
              Available in <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded font-semibold">9-pin SOIC8E</span> with exposed pad and <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded font-semibold">3x3 QFN-9</span> packages, MP1582 provides a compact solution with minimal external components.
            </p>
          </div>
        </>
      );
    }
    if (chapter.id === "applications") {
      return (
        <>
          {chTitle}
          <ul className="text-[14px] text-[var(--ink)] leading-[1.85] space-y-1">
            <li>• Distributed Power Systems</li>
            <li>• <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded">Networking Systems & 5G Equipment</span> <span className="text-[11px] font-mono text-[var(--ink-3)]">[拓展]</span></li>
            <li>• FPGA / DSP / ASIC / SoC Power Supplies</li>
            <li>• <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded">Solid State Drives (SSD)</span> <span className="text-[11px] font-mono text-[var(--ink-3)]">[新增]</span></li>
            <li>• <span className="bg-[rgba(46,139,90,0.15)] text-[#166534] px-1 rounded">Industrial Automation</span> <span className="text-[11px] font-mono text-[var(--ink-3)]">[新增]</span></li>
            <li>• Notebook & Tablet Computers</li>
          </ul>
        </>
      );
    }
    if (chapter.id === "function") {
      return (
        <>
          {chTitle}
          <div className="text-[14px] text-[var(--ink)] leading-[1.85]">
            <p className="mb-4">
              MP1582 在 MP1482 的电流模式控制基础上,新增了 <strong>Power Good 监测电路</strong>。当 V<sub>FB</sub> 上升到目标值的 95%(典型 0.57V)时,内部比较器拉高 PG 引脚,通知主控芯片(FPGA/MCU)电源已就绪。
            </p>
            <div className="bg-[var(--accent-soft)]/40 border border-[var(--accent)]/30 rounded-[10px] p-4 my-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--accent-ink)] mb-2">
                <Lightbulb size={13} />
                <span>站在客户视角:为什么这对您的设计有用</span>
              </div>
              <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
                传统 buck 设计需要外部电压检测电路才能实现电源时序,占用 2-3 个 GPIO 和外部 RC 网络。MP1582 内置 PG 让您只需一根线就能驱动 FPGA 的 RESET_N 或 MCU 的 PWR_GOOD,典型应用可省 4 个外围器件。
              </p>
            </div>
            <p className="text-[12px] text-[var(--ink-3)] italic">
              [此段为 AI 协助起草,深度尺度参考竞品 TI TPS54302 的 Power Good 描述风格]
            </p>
          </div>
        </>
      );
    }
    // 其他文本章节通用渲染
    return (
      <>
        {chTitle}
        <div className="text-[14px] text-[var(--ink)] leading-[1.85] whitespace-pre-line">
          {chapterData?.newText || "[本节内容待填写]"}
        </div>
      </>
    );
  }

  // 表格章节(极限参数 / 推荐参数 / 电气参数 / 订购信息)
  if (chapter.type === "table") {
    if (chapter.id === "electrical") {
      return (
        <>
          {chTitle}
          <div className="text-[12px] text-[var(--ink-3)] mb-3">
            V<sub>IN</sub> = 12V, T<sub>A</sub> = +25°C, unless otherwise noted.
          </div>
          <div className="border border-[var(--border)] rounded-[10px] overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F4F2FA] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-2.5 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">参数</th>
                  <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">符号</th>
                  <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">条件</th>
                  <th className="text-right py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">Min</th>
                  <th className="text-right py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">Typ</th>
                  <th className="text-right py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">Max</th>
                  <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">单位</th>
                </tr>
              </thead>
              <tbody>
                {elecTable.map((r, i) => {
                  const rowBg = r.added ? "bg-[rgba(46,139,90,0.06)]" : r.changed ? "bg-[rgba(88,71,204,0.05)]" : "";
                  return (
                    <tr key={i} className={`border-b border-[var(--border)] ${rowBg} hover:bg-[#FAFAFE]`}>
                      <td className="py-1.5 px-2.5 text-[12px] text-[var(--ink)]">
                        {r.added && <span className="font-mono text-[10px] text-[var(--success)] font-semibold mr-1">[新]</span>}
                        {r.changed && !r.added && <span className="font-mono text-[10px] text-[var(--accent)] font-semibold mr-1">[改]</span>}
                        {r.param}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-[11px] text-[var(--ink-2)]">{r.symbol}</td>
                      <td className="py-1.5 px-2 text-[11px] text-[var(--ink-3)]">{r.cond}</td>
                      <td className="py-1.5 px-2 font-mono text-[12px] text-right text-[var(--ink-2)]">{r.min}</td>
                      <td className="py-1.5 px-2 font-mono text-[12px] text-right text-[var(--ink)] font-medium">{r.typ}</td>
                      <td className="py-1.5 px-2 font-mono text-[12px] text-right text-[var(--ink-2)]">{r.max}</td>
                      <td className="py-1.5 px-2 font-mono text-[11px] text-[var(--ink-3)]">{r.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-[var(--ink-3)] mt-3 leading-relaxed">
            <Sparkles size={10} className="inline mr-1 text-[var(--accent)]" />
            AI 已对比 MP1482 原始数据 — 共 <strong className="text-[var(--accent)]">{elecTable.filter(r => r.changed && !r.added).length} 行修改</strong>,<strong className="text-[var(--success)]">{elecTable.filter(r => r.added).length} 行新增</strong>。等量产数据回填后再运行规范检查。
          </div>
        </>
      );
    }
    if (chapter.id === "absmax") {
      return (
        <>
          {chTitle}
          <div className="border border-[var(--border)] rounded-[10px] overflow-hidden">
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  { p: "Supply Voltage VIN",        v: "−0.3V to +21V",           changed: true },
                  { p: "Switch Node Voltage VSW",   v: "−0.3V to +24V",           changed: true },
                  { p: "Boost Voltage VBS",         v: "VSW − 0.3V to VSW + 6V" },
                  { p: "PG Pin Voltage",            v: "−0.3V to +6V",            added: true },
                  { p: "All Other Pins",            v: "−0.3V to +6V" },
                  { p: "Junction Temperature",      v: "150°C" },
                  { p: "Lead Temperature",          v: "260°C" },
                  { p: "Storage Temperature",       v: "−65°C to +150°C" },
                ].map((r, i) => (
                  <tr key={i} className={r.added ? "bg-[rgba(46,139,90,0.06)]" : r.changed ? "bg-[rgba(88,71,204,0.05)]" : ""}>
                    <td className="py-2 px-3 text-[13px] text-[var(--ink-2)]">
                      {r.added && <span className="font-mono text-[10px] text-[var(--success)] font-semibold mr-2">[新]</span>}
                      {r.changed && !r.added && <span className="font-mono text-[10px] text-[var(--accent)] font-semibold mr-2">[改]</span>}
                      {r.p}
                    </td>
                    <td className="py-2 px-3 font-mono text-[13px] text-[var(--ink)] text-right">{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    if (chapter.id === "ordering") {
      return (
        <>
          {chTitle}
          <div className="border border-[var(--border)] rounded-[10px] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F4F2FA]">
                  <th className="text-left py-2 px-3 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">PPN</th>
                  <th className="text-left py-2 px-3 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">封装</th>
                  <th className="text-left py-2 px-3 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">顶面标识</th>
                  <th className="text-left py-2 px-3 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">温度范围</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                <tr>
                  <td className="py-2 px-3 font-mono text-[13px] text-[var(--ink)]">MP1582DN-LF-Z</td>
                  <td className="py-2 px-3 text-[12px] text-[var(--ink-2)]">SOIC8E</td>
                  <td className="py-2 px-3 font-mono text-[12px] text-[var(--ink-2)]">MP1582DN</td>
                  <td className="py-2 px-3 text-[12px] text-[var(--ink-2)]">−40°C to +85°C</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-[13px] text-[var(--ink)]">MP1582GD-LF-Z</td>
                  <td className="py-2 px-3 text-[12px] text-[var(--ink-2)]">QFN-9 (3x3)</td>
                  <td className="py-2 px-3 font-mono text-[12px] text-[var(--ink-2)]">MP1582GD</td>
                  <td className="py-2 px-3 text-[12px] text-[var(--ink-2)]">−40°C to +85°C</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-[var(--ink-3)] mt-3 leading-relaxed">后缀说明:-LF = RoHS 合规,-Z = Tape & Reel 包装</div>
        </>
      );
    }
    // 其他表格章节通用
    return (
      <>
        {chTitle}
        <div className="text-[14px] text-[var(--ink)] leading-[1.85] whitespace-pre-line">
          {chapterData?.newText || "[本节表格内容待填写]"}
        </div>
      </>
    );
  }

  // 图片章节(应用电路 / 封装信息 / 曲线图 / PCB / POD)
  if (chapter.type === "image") {
    if (chapter.id === "package") {
      return (
        <>
          {chTitle}
          <div className="bg-[#F4F2FA] border border-[var(--border)] rounded-[12px] p-6 mb-5">
            <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-4">引脚分布 — SOIC8E (顶视图)</div>
            <div className="grid grid-cols-2 gap-2 max-w-[400px] mx-auto">
              {pins.map(p => (
                <div
                  key={p.num}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border ${
                    p.added ? "bg-[rgba(46,139,90,0.08)] border-[var(--success)]" :
                    p.changed ? "bg-[rgba(88,71,204,0.05)] border-[var(--accent)]" :
                    "bg-white border-[var(--border)]"
                  }`}
                >
                  <span className="font-mono text-[11px] text-[var(--ink-3)] w-4 flex-shrink-0">{p.num}</span>
                  <span className="font-mono text-[12px] font-semibold text-[var(--ink)] flex-shrink-0">{p.name}</span>
                  {p.added && <span className="font-mono text-[10px] text-[var(--success)] font-semibold ml-auto">新</span>}
                  {p.changed && !p.added && <span className="font-mono text-[10px] text-[var(--accent)] font-semibold ml-auto">改</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 text-[13px] text-[var(--ink-2)]">
            {pins.map(p => (
              <div key={p.num} className={`p-3 rounded-[8px] border-l-2 ${p.added ? "border-[var(--success)] bg-[rgba(46,139,90,0.04)]" : p.changed ? "border-[var(--accent)] bg-[rgba(88,71,204,0.04)]" : "border-[var(--border)]"}`}>
                <div className="font-mono text-[12px] font-semibold text-[var(--ink)] mb-1">
                  Pin {p.num} · {p.name}
                  {p.added && <span className="ml-2 font-mono text-[10px] text-[var(--success)]">[新增]</span>}
                  {p.changed && !p.added && <span className="ml-2 font-mono text-[10px] text-[var(--accent)]">[修改]</span>}
                </div>
                <div className="text-[12px] text-[var(--ink-2)] leading-snug">{p.desc}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
    // 其他图片章节通用
    return (
      <>
        {chTitle}
        <div className="bg-[#F4F2FA] border-2 border-dashed border-[var(--border-strong)] rounded-[12px] p-12 text-center">
          <ImagePlus size={32} className="mx-auto text-[var(--ink-3)] mb-3" strokeWidth={1.5} />
          <div className="text-[13px] text-[var(--ink-2)] mb-2">{chapter.name} 占位</div>
          <div className="text-[11px] text-[var(--ink-3)] mb-4">
            从素材库找匹配 / 从竞品 PDF 提取 / AI 生成
          </div>
          <button className="text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors px-3 py-1.5 rounded-[6px] inline-flex items-center gap-1">
            <Sparkles size={11} strokeWidth={2.2} />
            <span>让 AI 处理这张图</span>
          </button>
        </div>
        {chapterData?.newText && (
          <div className="text-[12px] text-[var(--ink-3)] mt-4 leading-relaxed">
            <strong>改动说明:</strong> {chapterData.newText}
          </div>
        )}
      </>
    );
  }

  return null;
};

// ============================================================
// ChapterNoteEditor — 章节备注列表 + 添加输入框
//   props:
//     chapter: 当前章节对象(读 notes / id)
//     currentUser: 用于显示输入区作者头像
//     onAdd(text): 父组件状态化添加(append 到 notes 顶部)
//     onDelete(noteId): 删除一条
//     onClose: 折叠编辑器
// ============================================================
const ChapterNoteEditor = ({ chapter, currentUser, onAdd, onDelete, onClose }) => {
  const [draft, setDraft] = useState("");
  const notes = chapter.notes || [];
  // 把 atMs 转成相对时间(刚刚 / X 分钟前 / X 小时前 / X 天前 / X 月 X 日)
  const formatTime = (ms) => {
    if (!ms) return "";
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    const d = new Date(ms);
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };
  const handleAdd = () => {
    if (draft.trim()) {
      onAdd(draft);
      setDraft("");
    }
  };
  return (
    <div className="mt-2 pt-2 border-t border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-[var(--ink-3)] tracking-wider uppercase">
          备注 · {notes.length} 条
        </span>
        <button
          onClick={onClose}
          className="text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] font-mono"
        >
          收起
        </button>
      </div>

      {/* 备注列表 */}
      {notes.length > 0 && (
        <div className="space-y-1.5 mb-2 max-h-[180px] overflow-y-auto scrollbar-thin">
          {notes.map(n => (
            <div key={n.id} className="group/note flex items-start gap-2 text-[11px] py-1 px-1.5 rounded-[4px] hover:bg-[#F4F2FA]">
              <Lightbulb size={10} strokeWidth={2.2} className="text-[var(--warning)] mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[var(--ink-2)] leading-snug whitespace-pre-wrap break-words">{n.text}</div>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-[var(--ink-3)]">
                  <span>{n.author}</span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span>{formatTime(n.atMs)}</span>
                </div>
              </div>
              <button
                onClick={() => onDelete(n.id)}
                className="opacity-0 group-hover/note:opacity-100 transition-opacity w-4 h-4 rounded-[3px] flex items-center justify-center text-[var(--ink-3)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] flex-shrink-0"
                title="删除"
              >
                <X size={10} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 添加输入框 */}
      <div className="flex items-start gap-1.5">
        <div
          className="w-5 h-5 rounded-full text-[9px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: currentUser.color.bg, color: currentUser.color.ink }}
        >
          {currentUser.initial}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // ⌘/Ctrl + Enter 提交
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="加一条备注…(⌘ Enter 提交)"
          rows={2}
          className="flex-1 resize-none text-[11px] px-2 py-1.5 rounded-[6px] bg-white border border-[var(--border)] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:border-[var(--accent)] leading-snug"
        />
        <button
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="h-7 px-2 rounded-[6px] text-[11px] font-medium bg-[var(--accent)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent-ink)] transition-colors flex-shrink-0 flex items-center gap-1"
        >
          <Send size={10} strokeWidth={2.4} />
          发送
        </button>
      </div>
    </div>
  );
};

const DocEditMain = ({ payload }) => {
  const currentUser = useCurrentUser();
  const product = payload?.product || "MP1582";
  const version = payload?.version || "v0.1-draft";
  const template = payload?.template || "企业 Buck v2.3";
  const [activeChapter, setActiveChapter] = useState("description");
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  // 大纲宽度(展开时可拖拽,140-320 px)
  const [outlineWidth, setOutlineWidth] = useState(192);
  const [outlineDragging, setOutlineDragging] = useState(false);
  // 章节状态下拉 + 备注弹窗的开关(共用同一 panel,简化 z-index)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const docEditRef = useRef(null);

  // 章节数据 — 从 getDocDetails 拿到 16 章 + 状态 + 修改人
  // 用 ALL_PRODUCTS 找到对应的 reviewState(给非详情产品的状态生成器)
  const productInfo = React.useMemo(() => {
    const found = ALL_PRODUCTS.find(p => p.ppn === product);
    return found || { ppn: product, reviewState: "draft" };
  }, [product]);
  const initialDocDetails = React.useMemo(() => getDocDetails(productInfo), [productInfo]);

  // chapters 状态化 — 用户切换状态会就地更新(demo 内 in-memory)
  const [chapters, setChapters] = useState(initialDocDetails.chapters);
  // 切换 product 时重置(切换到不同手册)
  useEffect(() => {
    setChapters(initialDocDetails.chapters);
    if (!initialDocDetails.chapters.find(c => c.id === activeChapter)) {
      setActiveChapter(initialDocDetails.chapters[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productInfo.ppn]);

  // 当前时间 → 「5 月 X 日 HH:MM」格式(对齐 mock 数据风格)
  const _nowDisplay = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${m} 月 ${d} 日 ${hh}:${mm}`;
  };

  // 直接设置章节状态(下拉菜单用)— 同时记录修改人为当前用户、修改时间为现在
  const setChapterStatus = (chapterId, newStatus) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        status: newStatus,
        lastModifier: currentUser.name,
        lastModifiedAt: _nowDisplay(),
      };
    }));
  };

  // 添加一条章节备注(往 notes[] 最前面插入,同时更新 note 单字段做预览)
  const addChapterNote = (chapterId, text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setChapters(prev => prev.map(ch => {
      if (ch.id !== chapterId) return ch;
      const newNote = {
        id: `${chapterId}-note-${Date.now()}`,
        author: currentUser.name,
        atMs: Date.now(),
        text: trimmed,
      };
      return {
        ...ch,
        notes: [newNote, ...(ch.notes || [])],
        note: trimmed, // 单字段保留为最新文本,供大纲 hover 等地预览
        lastModifier: currentUser.name,
        lastModifiedAt: _nowDisplay(),
      };
    }));
  };

  // 删除一条备注
  const deleteChapterNote = (chapterId, noteId) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id !== chapterId) return ch;
      const remaining = (ch.notes || []).filter(n => n.id !== noteId);
      return {
        ...ch,
        notes: remaining,
        note: remaining[0]?.text || null,
        lastModifier: currentUser.name,
        lastModifiedAt: _nowDisplay(),
      };
    }));
  };

  const progress = computeChapterProgress(chapters);
  const docNote = initialDocDetails.note;

  // 大纲拖拽逻辑
  useEffect(() => {
    if (!outlineDragging) return;
    const onMove = (e) => {
      if (!docEditRef.current) return;
      const rect = docEditRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newWidth = Math.max(140, Math.min(320, offsetX));
      setOutlineWidth(newWidth);
    };
    const onUp = () => setOutlineDragging(false);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [outlineDragging]);

  const activeChapterObj = chapters.find(c => c.id === activeChapter) || chapters[2];
  const cursorType = activeChapterObj.type;

  // 工具栏按钮组件
  const ToolbarButton = ({ icon: Icon, title, onClick, active, disabled }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors flex-shrink-0 ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
          : "text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      }`}
    >
      <Icon size={13} strokeWidth={2} />
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-4 bg-[var(--border)] mx-0.5 flex-shrink-0" />
  );

  return (
    <>
      {/* 顶栏 */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap flex-shrink-0">写作台</span>
          <span className="text-[var(--border-strong)] flex-shrink-0">·</span>
          <span className="font-mono text-[13px] font-semibold text-[var(--ink)] whitespace-nowrap flex-shrink-0">{product}</span>
          <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] text-[11px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">草稿 · {version}</span>
          <button
            className="text-[11px] text-[var(--ink-3)] hover:text-[var(--accent)] transition-colors whitespace-nowrap flex-shrink-0 ml-1 flex items-center gap-1"
            title="点击查看模板信息"
          >
            <span className="font-mono">模板:</span>
            <span>{template}</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" icon={Eye}>预览</Button>
          <Button variant="primary" size="sm" iconRight={ArrowRight}>提交审批</Button>
        </div>
      </header>

      {/* AI-native 工具栏 — 根据当前章节类型动态切换 */}
      <div className="h-10 border-b border-[var(--border)] bg-[#F4F2FA] flex items-center px-3 gap-0.5 flex-shrink-0 overflow-x-auto scrollbar-thin">
        {/* 当前章节标识 */}
        <div className="flex items-center gap-1.5 px-2 mr-1 flex-shrink-0">
          <span className="text-[11px] text-[var(--ink-3)]">当前:</span>
          <span className="text-[12px] font-medium text-[var(--ink)] flex items-center gap-1">
            {cursorType === "text" && <PenLine size={11} strokeWidth={2.2} />}
            {cursorType === "table" && <Table2 size={11} strokeWidth={2.2} />}
            {cursorType === "image" && <ImagePlus size={11} strokeWidth={2.2} />}
            <span>{cursorType === "text" ? "文本" : cursorType === "table" ? "表格" : "图片"}章节</span>
          </span>
        </div>
        <ToolbarDivider />

        {/* 历史 — 所有类型通用 */}
        <ToolbarButton icon={Undo2} title="撤销 ⌘Z" />
        <ToolbarButton icon={Redo2} title="重做 ⌘⇧Z" />
        <ToolbarDivider />

        {/* === 文本章节工具组 === */}
        {cursorType === "text" && (
          <>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0"
              title="标题级别"
            >
              <span>正文</span>
              <ChevronDown size={10} strokeWidth={2.4} />
            </button>
            <ToolbarDivider />
            <ToolbarButton icon={Bold} title="加粗 ⌘B" />
            <ToolbarButton icon={Italic} title="斜体 ⌘I" />
            <ToolbarButton icon={Underline} title="下划线 ⌘U" />
            <ToolbarDivider />
            <ToolbarButton icon={List} title="无序列表" />
            <ToolbarButton icon={ListOrdered} title="有序列表" />
            <ToolbarDivider />
            {/* 文本类 AI 工具 */}
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="AI 起草这段"
            >
              <Sparkles size={11} strokeWidth={2.2} />
              <span>AI 起草</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 whitespace-nowrap"
              title="拿竞品同位置文本对照"
            >
              <FileSearch size={11} strokeWidth={2.2} />
              <span>对照竞品</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 whitespace-nowrap"
              title="调整深浅尺度"
            >
              <Lightbulb size={11} strokeWidth={2.2} />
              <span>调整深度</span>
            </button>
          </>
        )}

        {/* === 表格章节工具组 === */}
        {cursorType === "table" && (
          <>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="粘贴 raw 测试数据,AI 自动整理"
            >
              <Upload size={11} strokeWidth={2.2} />
              <span>粘贴 raw 数据</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="自动整理 Min/Typ/Max"
            >
              <Sparkles size={11} strokeWidth={2.2} />
              <span>AI 整理三栏</span>
            </button>
            <ToolbarDivider />
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 whitespace-nowrap"
              title="检查测试条件 / 单位规范"
            >
              <CheckCircle2 size={11} strokeWidth={2.2} />
              <span>检查规范</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] text-[var(--ink-2)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 whitespace-nowrap"
              title="对比 TI/MPS 同类参数"
            >
              <BarChart3 size={11} strokeWidth={2.2} />
              <span>对比竞品</span>
            </button>
            <ToolbarDivider />
            <ToolbarButton icon={Plus} title="加一行" />
            <ToolbarButton icon={X} title="删一行" />
          </>
        )}

        {/* === 图片章节工具组 === */}
        {cursorType === "image" && (
          <>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="从素材库找匹配"
            >
              <Library size={11} strokeWidth={2.2} />
              <span>素材库找</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="从竞品 PDF 提取参考"
            >
              <FileSearch size={11} strokeWidth={2.2} />
              <span>竞品参考</span>
            </button>
            <button
              className="h-7 px-2 rounded-[6px] flex items-center gap-1 text-[12px] font-medium text-[var(--accent-ink)] bg-[var(--accent-soft)] hover:bg-[#DCD2FF] transition-colors flex-shrink-0 whitespace-nowrap"
              title="AI 生成图(应用电路/曲线图)"
            >
              <Sparkles size={11} strokeWidth={2.2} />
              <span>AI 生成</span>
            </button>
            <ToolbarDivider />
            <ToolbarButton icon={Upload} title="上传图片" />
            <ToolbarButton icon={PenLine} title="添加标注" />
          </>
        )}
      </div>

      {/* 三段:ToC + 正文 */}
      <div ref={docEditRef} className="flex-1 flex overflow-hidden relative">
        {/* 大纲(可收起) */}
        {outlineCollapsed ? (
          <aside className="w-10 bg-[#F4F2FA] flex flex-col flex-shrink-0 overflow-hidden">
            {/* 收起态:展开按钮 */}
            <button
              onClick={() => setOutlineCollapsed(false)}
              title="展开大纲"
              className="h-9 flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 border-b border-[var(--border)]"
            >
              <PanelLeftOpen size={13} strokeWidth={2} />
            </button>
            {/* 收起态章节列表 — 仅显数字 */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2 flex flex-col items-center gap-0.5">
              {chapters.map(ch => {
                const isActive = activeChapter === ch.id;
                const showDot = !isActive && ch.status !== "empty";
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    title={`${ch.num}. ${ch.name} · ${CHAPTER_STATUS[ch.status]?.label || ""}`}
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-mono text-[11px] transition-colors relative ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent-ink)] font-semibold"
                        : "text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
                    }`}
                  >
                    {ch.num}
                    {showDot && (
                      <span
                        className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full"
                        style={{ background: CHAPTER_STATUS[ch.status]?.dot }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        ) : (
          <aside
            className="bg-[#F4F2FA] overflow-y-auto scrollbar-thin flex-shrink-0"
            style={{ width: outlineWidth }}
          >
            {/* 展开态:大纲标题 + 收起按钮 */}
            <div className="h-9 px-2.5 flex items-center justify-between border-b border-[var(--border)] flex-shrink-0">
              <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase">章节大纲</span>
              <button
                onClick={() => setOutlineCollapsed(true)}
                title="收起大纲"
                className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors"
              >
                <PanelLeftClose size={12} strokeWidth={2} />
              </button>
            </div>
            <div className="py-2 px-2.5 space-y-0.5">
              {chapters.map(ch => {
                const isActive = activeChapter === ch.id;
                const statusMeta = CHAPTER_STATUS[ch.status] || CHAPTER_STATUS.empty;
                const noteCount = ch.notes?.length || 0;
                // hover tooltip 内容(原生 title 实现 — 简单可靠,无需自建 popper)
                const tipParts = [`${ch.num}. ${ch.name}`, statusMeta.label];
                if (ch.lastModifier) tipParts.push(`最后由 ${ch.lastModifier}`);
                if (ch.lastModifiedAt) tipParts.push(ch.lastModifiedAt);
                if (noteCount > 0) tipParts.push(`${noteCount} 条备注:${ch.notes[0].text}`);
                const tip = tipParts.join(" · ");
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    title={tip}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded-[6px] text-[12px] text-left transition-colors group/ch ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent-ink)] font-medium"
                        : "text-[var(--ink-2)] hover:bg-[#EEEAF7]"
                    }`}
                  >
                    <span className="w-2 flex-shrink-0">
                      {ch.status === "done" && <Check size={9} className="text-[var(--success)]" strokeWidth={3} />}
                      {ch.status === "in-progress" && <span className="block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                      {ch.status === "warn" && <span className="block w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />}
                      {ch.status === "empty" && <span className="block w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] opacity-60" />}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--ink-3)] w-4 flex-shrink-0">{ch.num}</span>
                    <span className="flex-1 truncate">{ch.name}</span>
                    {/* 有备注 → 右侧黄色小灯泡 + 数字角标 */}
                    {noteCount > 0 && (
                      <span className="flex items-center gap-0.5 flex-shrink-0">
                        <Lightbulb
                          size={9}
                          strokeWidth={2.4}
                          className="text-[var(--warning)] opacity-70 group-hover/ch:opacity-100"
                        />
                        {noteCount > 1 && (
                          <span className="font-mono text-[9px] text-[var(--warning)] opacity-70 group-hover/ch:opacity-100">
                            {noteCount}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
              {/* 大纲底部统计 — 4 段堆叠对齐 WritingDoingMain 视觉 */}
              <div className="mt-3 pt-3 border-t border-[var(--border)] px-2 space-y-1 text-[11px] text-[var(--ink-3)]">
                <div className="flex items-center gap-1.5">
                  <Check size={9} className="text-[var(--success)]" strokeWidth={3} />
                  <span>已完成 {progress.done} 节</span>
                </div>
                {progress.inProgress > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    <span>写作中 {progress.inProgress} 节</span>
                  </div>
                )}
                {progress.warn > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                    <span>需复核 {progress.warn} 节</span>
                  </div>
                )}
                {progress.empty > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] opacity-60" />
                    <span>空白 {progress.empty} 节</span>
                  </div>
                )}
                <div className="pt-1.5 mt-1.5 border-t border-[var(--border)] flex items-center justify-between font-mono">
                  <span>整体完成度</span>
                  <span className="text-[var(--ink)] font-semibold">{progress.percent}%</span>
                </div>
                {/* 4 段堆叠进度条 — 对齐 WritingDoingMain 视觉 */}
                <div
                  className="flex h-[4px] rounded-full overflow-hidden bg-[#F4F2FA]"
                  title={`已完成 ${progress.done} · 写作中 ${progress.inProgress} · 需复核 ${progress.warn} · 空白 ${progress.empty}`}
                >
                  {progress.done > 0 && <div style={{ width: `${(progress.done/progress.total)*100}%`, background: CHAPTER_STATUS.done.dot }} />}
                  {progress.inProgress > 0 && <div style={{ width: `${(progress.inProgress/progress.total)*100}%`, background: CHAPTER_STATUS["in-progress"].dot }} />}
                  {progress.warn > 0 && <div style={{ width: `${(progress.warn/progress.total)*100}%`, background: CHAPTER_STATUS.warn.dot }} />}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 大纲↔正文 拖拽条(仅展开态) */}
        {!outlineCollapsed && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setOutlineDragging(true);
            }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: outlineWidth - 8,
              width: 16,
              cursor: "col-resize",
              zIndex: 40,
              touchAction: "none",
            }}
            className="group"
          >
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full transition-colors"
              style={{
                background: outlineDragging ? "var(--accent)" : "transparent",
              }}
            />
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: outlineDragging ? "transparent" : "var(--border-strong)",
              }}
            />
          </div>
        )}

        {/* 中:正文 — 按章节动态渲染 */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-[680px] mx-auto px-8 py-7">
            {/* 章节状态栏 — 状态切换 / 修改人 / 备注 */}
            <div className="mb-5 -mx-2 px-3 py-2.5 bg-[#FBFAFD] border border-[var(--border)] rounded-[10px]">
              <div className="flex items-start gap-3 flex-wrap">
                {/* 状态徽标(点击展开下拉,直接选目标状态) */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => { setStatusMenuOpen(o => !o); setNoteEditorOpen(false); }}
                    className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-[6px] text-[11px] font-medium transition-all hover:opacity-80"
                    style={{
                      background: CHAPTER_STATUS[activeChapterObj.status]?.bg || "transparent",
                      color: CHAPTER_STATUS[activeChapterObj.status]?.ink || "#9B95A8",
                      border: `1px solid ${CHAPTER_STATUS[activeChapterObj.status]?.dot || "#C9C2DD"}`,
                    }}
                    title="切换章节状态"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: CHAPTER_STATUS[activeChapterObj.status]?.dot }}
                    />
                    <span>{CHAPTER_STATUS[activeChapterObj.status]?.label || "空白"}</span>
                    <ChevronDown size={10} strokeWidth={2.4} className="opacity-70" />
                  </button>
                  {statusMenuOpen && (
                    <>
                      {/* click-outside 遮罩 */}
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setStatusMenuOpen(false)}
                      />
                      <div
                        className="absolute left-0 mt-1 w-36 bg-white border border-[var(--border)] rounded-[8px] py-1 anim-fade-up"
                        style={{ zIndex: 31, boxShadow: "0 8px 24px rgba(24,20,38,0.10)" }}
                      >
                        {CHAPTER_STATUS_CYCLE.map(s => {
                          const meta = CHAPTER_STATUS[s];
                          const active = activeChapterObj.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                setChapterStatus(activeChapter, s);
                                setStatusMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 h-7 text-[11px] transition-colors ${
                                active ? "bg-[#EEEAF7]" : "hover:bg-[#F4F2FA]"
                              }`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: meta.dot }}
                              />
                              <span className="flex-1 text-left" style={{ color: meta.ink }}>{meta.label}</span>
                              {active && <Check size={10} strokeWidth={2.6} className="text-[var(--accent)]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* 修改人 / 时间 */}
                {activeChapterObj.lastModifier ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-3)] font-mono">
                    <User size={11} strokeWidth={2} />
                    <span>最后由</span>
                    <span className="text-[var(--ink-2)] font-medium">{activeChapterObj.lastModifier}</span>
                    <span className="text-[var(--border-strong)]">·</span>
                    <span>{activeChapterObj.lastModifiedAt}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-[var(--ink-3)] italic">未编辑过</div>
                )}

                <div className="flex-1 min-w-0" />

                {/* 备注按钮 — 显示备注数 + 点击打开备注弹窗 */}
                <button
                  onClick={() => { setNoteEditorOpen(o => !o); setStatusMenuOpen(false); }}
                  className={`flex items-center gap-1 h-6 px-1.5 rounded-[4px] text-[11px] transition-colors flex-shrink-0 ${
                    noteEditorOpen
                      ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                      : (activeChapterObj.notes?.length > 0)
                        ? "text-[var(--warning)] hover:bg-[#FCEFCB]/60"
                        : "text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)]"
                  }`}
                  title={activeChapterObj.notes?.length > 0 ? `${activeChapterObj.notes.length} 条备注` : "添加备注"}
                >
                  <Lightbulb size={11} strokeWidth={2.2} />
                  <span className="font-mono">{activeChapterObj.notes?.length || 0}</span>
                </button>

                {/* 章节切换按钮(上一章/下一章) */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      const idx = chapters.findIndex(c => c.id === activeChapter);
                      if (idx > 0) setActiveChapter(chapters[idx - 1].id);
                    }}
                    disabled={chapters.findIndex(c => c.id === activeChapter) === 0}
                    className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上一章"
                  >
                    <ChevronUp size={11} strokeWidth={2.2} />
                  </button>
                  <button
                    onClick={() => {
                      const idx = chapters.findIndex(c => c.id === activeChapter);
                      if (idx < chapters.length - 1) setActiveChapter(chapters[idx + 1].id);
                    }}
                    disabled={chapters.findIndex(c => c.id === activeChapter) === chapters.length - 1}
                    className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下一章"
                  >
                    <ChevronDown size={11} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {/* 备注预览(收起态)— 只显最新一条 */}
              {!noteEditorOpen && activeChapterObj.notes?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-start gap-1.5 text-[11px] text-[var(--ink-2)]">
                  <Lightbulb size={11} strokeWidth={2} className="text-[var(--warning)] mt-0.5 flex-shrink-0" />
                  <span className="leading-snug flex-1">{activeChapterObj.notes[0].text}</span>
                  {activeChapterObj.notes.length > 1 && (
                    <button
                      onClick={() => setNoteEditorOpen(true)}
                      className="text-[10px] text-[var(--accent-ink)] hover:underline flex-shrink-0 font-mono"
                    >
                      +{activeChapterObj.notes.length - 1} 更多
                    </button>
                  )}
                </div>
              )}

              {/* 备注编辑器(展开态)— 列表 + 添加输入框 */}
              {noteEditorOpen && (
                <ChapterNoteEditor
                  chapter={activeChapterObj}
                  currentUser={currentUser}
                  onAdd={(text) => addChapterNote(activeChapter, text)}
                  onDelete={(noteId) => deleteChapterNote(activeChapter, noteId)}
                  onClose={() => setNoteEditorOpen(false)}
                />
              )}
            </div>

            <ChapterContent
              chapter={activeChapterObj}
              chapterData={CHAPTERS_DATA[activeChapter]}
              elecTable={MP1582_ELEC_TABLE}
              originalElecTable={MP1482_ELEC_TABLE}
              pins={MP1582_PINS}
              originalPins={MP1482_PINS}
              project={MP1582_PROJECT}
            />

            <div className="mt-7 pt-5 border-t border-[var(--border)]">
              <div className="text-[11px] text-[var(--ink-3)] flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[var(--accent-soft)] border border-[var(--accent)]" />
                  AI 已修改字段
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[rgba(46,139,90,0.15)] border border-[var(--success)]" />
                  新增字段
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#F4F2FA] border border-[var(--border)]" />
                  保留字段
                </span>
                <span className="text-[var(--border-strong)]">·</span>
                <span>右侧 AI 对话随时帮你改</span>
              </div>
              {/* 文档级备注 */}
              {docNote && (
                <div className="mt-3 px-3 py-2 bg-[var(--accent-soft)]/30 border-l-2 border-[var(--accent)] rounded-r-[6px] text-[12px] text-[var(--ink-2)] leading-snug">
                  <span className="font-mono text-[10px] text-[var(--accent-ink)] uppercase tracking-wider mr-1.5">手册备注</span>
                  {docNote}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// ============================================================
// ColumnFilterPopover — 列筛选弹出框
//   text 模式: 仅输入框(模糊匹配)
//   enum 模式: 输入框 + 选项 checkbox + 当前匹配数预览
// ============================================================
const ColumnFilterPopover = ({
  open,
  onClose,
  mode,           // "text" | "enum"
  options,        // [{ value, label, count }] for enum mode
  value,          // string for text, array for enum
  onChange,       // (newValue) => void
  placeholder = "搜索...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const popRef = useRef(null);

  // 同步 value 到 search(text 模式)
  useEffect(() => {
    if (mode === "text" && open) setSearchTerm(value || "");
  }, [open, value, mode]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose();
    };
    // 延迟绑定避免立刻触发
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  if (mode === "text") {
    return (
      <div
        ref={popRef}
        className="absolute top-full left-0 mt-1 bg-white rounded-[8px] border border-[var(--border)] anim-fade-up"
        style={{
          width: 220,
          zIndex: 50,
          boxShadow: "0 8px 24px rgba(24,20,38,0.12), 0 2px 4px rgba(24,20,38,0.06)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[var(--border)] rounded-[6px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 placeholder:text-[var(--ink-4)] text-[var(--ink)]"
          />
          <div className="text-[10px] text-[var(--ink-3)] mt-1.5 px-1 font-mono">
            模糊匹配,实时过滤
          </div>
        </div>
        {value && (
          <div className="border-t border-[var(--border)] p-1.5">
            <button
              onClick={() => { setSearchTerm(""); onChange(""); }}
              className="w-full px-2 py-1 text-[11px] text-[var(--ink-3)] hover:bg-[#F4F2FA] hover:text-[var(--ink)] rounded transition-colors text-left flex items-center gap-1.5"
            >
              <X size={11} strokeWidth={2.2} />
              清除筛选
            </button>
          </div>
        )}
      </div>
    );
  }

  // enum 模式
  const currentValues = Array.isArray(value) ? value : [];
  const filteredOptions = (options || []).filter(opt =>
    !searchTerm || opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const toggleValue = (v) => {
    if (currentValues.includes(v)) {
      onChange(currentValues.filter(x => x !== v));
    } else {
      onChange([...currentValues, v]);
    }
  };
  const matchCount = currentValues.length === 0
    ? options.reduce((s, o) => s + o.count, 0)
    : options.filter(o => currentValues.includes(o.value)).reduce((s, o) => s + o.count, 0);

  return (
    <div
      ref={popRef}
      className="absolute top-full left-0 mt-1 bg-white rounded-[8px] border border-[var(--border)] anim-fade-up overflow-hidden"
      style={{
        width: 240,
        zIndex: 50,
        boxShadow: "0 8px 24px rgba(24,20,38,0.12), 0 2px 4px rgba(24,20,38,0.06)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b border-[var(--border)]">
        <input
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[var(--border)] rounded-[6px] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 placeholder:text-[var(--ink-4)] text-[var(--ink)]"
        />
      </div>

      <div className="max-h-[280px] overflow-y-auto scrollbar-thin py-1">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-[var(--ink-4)] italic">无匹配选项</div>
        ) : (
          filteredOptions.map(opt => {
            const checked = currentValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F4F2FA] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleValue(opt.value)}
                  className="w-3.5 h-3.5 accent-[var(--accent)] cursor-pointer"
                />
                <span className="flex-1 text-[12px] text-[var(--ink)] truncate">{opt.label}</span>
                <span className="font-mono text-[10px] text-[var(--ink-3)] flex-shrink-0">{opt.count}</span>
              </label>
            );
          })
        )}
      </div>

      <div className="border-t border-[var(--border)] px-3 py-2 bg-[#FAFAFE] flex items-center justify-between text-[11px]">
        <span className="font-mono text-[var(--ink-3)]">
          匹配 <strong className="text-[var(--accent-ink)] font-semibold">{matchCount}</strong> 项
        </span>
        {currentValues.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-[var(--ink-3)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
          >
            <X size={11} strokeWidth={2.2} />
            清除
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// 11. DocListMain — 文档列表主区(查询场景)
// ============================================================
const DocListMain = ({ payload }) => {
  const filter = payload?.filter || "all";
  // 外部 AI 设的 filter(从 payload.aiFilters 接收)
  const aiFilters = payload?.aiFilters || null;
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState({ "all": true, "dcdc": true, "linear": false, "pmic": false, "battery": false, "acdc": false, "gate": false });
  const [categoryCollapsed, setCategoryCollapsed] = useState(false);

  // 列筛选 state
  // 文本列(ppn/title/owner/update/latestVersion):字符串
  // 枚举列(category/lifecycle/reviewState/publishState):数组(多选)
  const [colFilters, setColFilters] = useState({
    ppn: "",
    category: [],
    lifecycle: [],
    title: "",
    latestVersion: "",
    reviewState: [],
    publishState: [],
    owner: "",
    update: "",
  });

  // 当前打开的筛选 popover 列 key
  const [openFilterCol, setOpenFilterCol] = useState(null);

  // 当 aiFilters 变化(AI 应用筛选时),merge 进 colFilters
  useEffect(() => {
    if (aiFilters) {
      setColFilters(prev => ({ ...prev, ...aiFilters }));
      setPage(1);
    }
  }, [aiFilters]);

  // 分页
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  const categoryTree = CATEGORY_TREE;

  let docs = ALL_PRODUCTS;

  // 应用分类树筛选
  if (activeCategory && activeCategory !== "all") {
    const leafIds = getLeafCategoryIds(activeCategory);
    docs = docs.filter(d => leafIds.includes(d.category));
  }

  // 应用旧的 filter prop(如果有)
  if (filter === "review")    docs = docs.filter(d => d.reviewState === "review");
  if (filter === "published") docs = docs.filter(d => d.publishState === "published");
  if (filter === "draft")     docs = docs.filter(d => d.reviewState === "draft");

  // 应用列筛选 — 字符串模糊匹配 OR 数组多选
  const fuzzy = (val, q) => {
    if (!q || (typeof q === "string" && q.trim() === "")) return true;
    return String(val || "").toLowerCase().includes(q.toLowerCase());
  };
  const matchEnum = (val, arr) => {
    if (!arr || arr.length === 0) return true;
    return arr.includes(val);
  };

  if (colFilters.ppn)           docs = docs.filter(d => fuzzy(d.ppn, colFilters.ppn));
  if (colFilters.title)         docs = docs.filter(d => fuzzy(d.title, colFilters.title));
  if (colFilters.latestVersion) docs = docs.filter(d => fuzzy(d.latestVersion, colFilters.latestVersion));
  if (colFilters.owner)         docs = docs.filter(d => fuzzy(d.owner, colFilters.owner));
  if (colFilters.update)        docs = docs.filter(d => fuzzy(d.update, colFilters.update));

  // 枚举列(数组多选)
  if (colFilters.category && colFilters.category.length > 0) {
    docs = docs.filter(d => matchEnum(d.category, colFilters.category));
  }
  if (colFilters.lifecycle && colFilters.lifecycle.length > 0) {
    docs = docs.filter(d => matchEnum(d.lifecycle, colFilters.lifecycle));
  }
  if (colFilters.reviewState && colFilters.reviewState.length > 0) {
    docs = docs.filter(d => matchEnum(d.reviewState, colFilters.reviewState));
  }
  if (colFilters.publishState && colFilters.publishState.length > 0) {
    docs = docs.filter(d => matchEnum(d.publishState, colFilters.publishState));
  }

  // 当前页数据
  const totalCount = docs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedDocs = docs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 是否有筛选生效(包括分类树)
  const hasColFilter = (
    !!colFilters.ppn || !!colFilters.title || !!colFilters.latestVersion ||
    !!colFilters.owner || !!colFilters.update ||
    (colFilters.category?.length > 0) ||
    (colFilters.lifecycle?.length > 0) ||
    (colFilters.reviewState?.length > 0) ||
    (colFilters.publishState?.length > 0)
  );
  const hasFilter = hasColFilter;
  const clearAllFilters = () => {
    setColFilters({
      ppn: "", category: [], lifecycle: [], title: "", latestVersion: "",
      reviewState: [], publishState: [], owner: "", update: "",
    });
    setPage(1);
  };

  // 单列是否有筛选
  const isColFiltered = (key) => {
    const v = colFilters[key];
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  };
  // 单列筛选清除
  const clearColFilter = (key) => {
    setColFilters(prev => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : "" }));
    setPage(1);
  };

  // 计算面包屑路径
  const breadcrumb = (() => {
    const find = (nodes, parents) => {
      for (const n of nodes) {
        const path = [...parents, n.name];
        if (n.id === activeCategory) return path;
        if (n.children) {
          const r = find(n.children, path);
          if (r) return r;
        }
      }
      return null;
    };
    const path = find(categoryTree, []);
    return path ? path.join(" > ") : "全部";
  })();

  // 计算枚举列的选项 + 每个选项的计数
  // 注意:计数基于"应用了其他列筛选,但不含本列筛选"的数据集
  const computeEnumOptions = (key) => {
    // 应用除了 key 之外的其他筛选
    let scope = ALL_PRODUCTS;
    if (activeCategory && activeCategory !== "all") {
      const leafIds = getLeafCategoryIds(activeCategory);
      scope = scope.filter(d => leafIds.includes(d.category));
    }
    Object.entries(colFilters).forEach(([k, v]) => {
      if (k === key) return;
      if (Array.isArray(v) && v.length > 0) {
        scope = scope.filter(d => v.includes(d[k]));
      } else if (typeof v === "string" && v.trim() !== "") {
        scope = scope.filter(d => fuzzy(d[k], v));
      }
    });
    // 按 key 聚合
    const counts = {};
    scope.forEach(d => {
      const v = d[key];
      counts[v] = (counts[v] || 0) + 1;
    });
    let labelMap = {};
    if (key === "category") labelMap = CATEGORY_LABEL_MAP;
    else if (key === "lifecycle") labelMap = { "在研": "在研", "量产": "量产", "改版中": "改版中", "EOL": "EOL" };
    else if (key === "reviewState") labelMap = { draft: "草稿", review: "审核中", approved: "已通过", rejected: "被拒绝" };
    else if (key === "publishState") labelMap = { unpublished: "待发布", published: "已发布", withdrawn: "已撤回" };
    return Object.entries(counts)
      .map(([value, count]) => ({ value, label: labelMap[value] || value, count }))
      .sort((a, b) => b.count - a.count);
  };

  const reviewBadge = {
    draft:    { label: "草稿",   bg: "#F4F2FA",  ink: "#6B6680" },
    review:   { label: "审核中", bg: "#FCEFCB",  ink: "#92400E" },
    approved: { label: "已通过", bg: "#E5F5EC",  ink: "#166534" },
    rejected: { label: "被拒绝", bg: "#FBE5EA",  ink: "#991B1B" },
  };

  const publishBadge = {
    unpublished: { label: "待发布", bg: "#FCEFCB",  ink: "#92400E" },
    published:   { label: "已发布", bg: "#E5F5EC",  ink: "#166534" },
    withdrawn:   { label: "已撤回", bg: "#F4F2FA",  ink: "#6B6680" },
  };

  const lifecycleStyle = {
    "在研":   { bg: "rgba(59, 130, 246, 0.1)",  ink: "#1D4ED8" },
    "改版中": { bg: "rgba(216, 144, 32, 0.1)",  ink: "#92400E" },
    "量产":   { bg: "rgba(46, 139, 90, 0.1)",   ink: "#166534" },
    "EOL":    { bg: "rgba(107, 102, 128, 0.1)", ink: "#6B6680" },
  };

  // 递归渲染分类节点
  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const isActive = activeCategory === node.id;
    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              setExpanded(prev => ({ ...prev, [node.id]: !prev[node.id] }));
            }
            setActiveCategory(node.id);
          }}
          className={`w-full flex items-center gap-1 py-1 rounded-[6px] text-[12px] text-left transition-colors ${
            isActive
              ? "bg-[var(--accent-soft)] text-[var(--accent-ink)] font-medium"
              : "text-[var(--ink-2)] hover:bg-[#EEEAF7]"
          }`}
          style={{ paddingLeft: 4 + depth * 14, paddingRight: 6 }}
        >
          {hasChildren ? (
            <ChevronRight size={11} strokeWidth={2.4} className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          ) : (
            <span className="w-2.5 flex-shrink-0" />
          )}
          <span className="flex-1 truncate">{node.name}</span>
          <span className="font-mono text-[11px] text-[var(--ink-3)] flex-shrink-0">{node.count}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 表格列定义 — 每列有 default(初始) min(下限) max(上限) 三个宽度
  const cols = [
    { key: "ppn",          label: "PPN",       def: 130, min: 100, max: 200 },
    { key: "category",     label: "产品家族",  def: 110, min: 80,  max: 180 },
    { key: "lifecycle",    label: "生命周期",  def: 100, min: 80,  max: 140 },
    { key: "preview",      label: "预览",      def: 70,  min: 56,  max: 90  },
    { key: "title",        label: "标题",      def: 280, min: 180, max: 480 },
    { key: "latestVersion", label: "版本",     def: 80,  min: 60,  max: 120 },
    { key: "reviewState",  label: "审核状态",  def: 110, min: 90,  max: 160 },
    { key: "publishState", label: "发布状态",  def: 130, min: 100, max: 180 },
    { key: "owner",        label: "撰写人",    def: 100, min: 80,  max: 160 },
    { key: "update",       label: "更新时间",  def: 130, min: 100, max: 180 },
    { key: "actions",      label: "操作",      def: 110, min: 90,  max: 160, sticky: true },
  ];

  // 列宽 state(每列各自一个 width,初始用 def)
  const [colWidths, setColWidths] = useState(() => {
    const obj = {};
    cols.forEach(c => { obj[c.key] = c.def; });
    return obj;
  });
  const [resizingCol, setResizingCol] = useState(null);

  // 列宽拖拽:鼠标按下后,根据鼠标 X 偏移更新该列 width
  useEffect(() => {
    if (!resizingCol) return;
    const { key, startX, startWidth, min, max } = resizingCol;
    const onMove = (e) => {
      const dx = e.clientX - startX;
      const newWidth = Math.max(min, Math.min(max, startWidth + dx));
      setColWidths(prev => ({ ...prev, [key]: newWidth }));
    };
    const onUp = () => setResizingCol(null);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizingCol]);

  const startColResize = (key, e, min, max) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol({
      key,
      startX: e.clientX,
      startWidth: colWidths[key],
      min,
      max,
    });
  };

  return (
    <>
      {/* 顶栏 */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap flex-shrink-0">产品中心</span>
          <span className="text-[12px] text-[var(--ink-3)] font-mono whitespace-nowrap flex-shrink-0">· {docs.length} 条</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" icon={Filter}>筛选</Button>
          <Button variant="secondary" size="sm" icon={Plus}>新建</Button>
        </div>
      </header>

      {/* 双栏:左分类树 + 右产品表格 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 分类树 (可收起) */}
        {categoryCollapsed ? (
          <aside className="w-10 bg-[#F4F2FA] flex flex-col flex-shrink-0">
            <button
              onClick={() => setCategoryCollapsed(false)}
              title="展开分类树"
              className="h-9 flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors flex-shrink-0 border-b border-[var(--border)]"
            >
              <PanelLeftOpen size={13} strokeWidth={2} />
            </button>
            {/* 收起态:垂直显示当前分类名 */}
            <div className="flex-1 flex items-start justify-center pt-3">
              <div
                className="font-mono text-[11px] text-[var(--ink-2)] tracking-wider"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {breadcrumb}
              </div>
            </div>
          </aside>
        ) : (
          <aside className="w-52 bg-[#F4F2FA] flex flex-col flex-shrink-0">
            <div className="h-9 px-2.5 flex items-center justify-between border-b border-[var(--border)] flex-shrink-0">
              <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase">产品分类</span>
              <button
                onClick={() => setCategoryCollapsed(true)}
                title="收起分类树"
                className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[var(--ink-3)] hover:bg-[#EEEAF7] hover:text-[var(--ink)] transition-colors"
              >
                <PanelLeftClose size={12} strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2.5">
              <div className="space-y-0.5">
                {categoryTree.map(n => renderTreeNode(n, 0))}
              </div>
            </div>
          </aside>
        )}

        {/* 表格区 */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* AI 提示条 + 筛选状态 */}
          <div className="flex-shrink-0 border-b border-[var(--border)] px-4 py-2 bg-[var(--accent-soft)]/40 flex items-center gap-2 flex-wrap">
            <Sparkles size={11} className="text-[var(--accent-ink)] flex-shrink-0" />
            <div className="flex-1 text-[12px] text-[var(--accent-ink)] leading-snug">
              {hasFilter ? (
                <>已筛选出 <strong className="font-semibold">{totalCount}</strong> 项 / 共 <strong>{ALL_PRODUCTS.length}</strong> 项</>
              ) : (
                <>共 <strong className="font-semibold">{totalCount}</strong> 项产品。可在每列下方输入筛选,或对 AI 说"找 Buck 类的、待发布的"。</>
              )}
            </div>
            {hasFilter && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[var(--accent-ink)] hover:text-[var(--accent)] flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/50 transition-colors"
              >
                <X size={11} strokeWidth={2.2} />
                <span>清除全部筛选</span>
              </button>
            )}
          </div>

          {/* 当前筛选 chip */}
          {hasFilter && (
            <div className="flex-shrink-0 border-b border-[var(--border)] px-4 py-1.5 flex items-center gap-1.5 flex-wrap bg-[#FAF8FE]">
              <span className="font-mono text-[10px] text-[var(--ink-3)] tracking-wider uppercase mr-1">已应用</span>
              {Object.entries(colFilters).filter(([k, v]) => {
                if (Array.isArray(v)) return v.length > 0;
                return v && v !== "";
              }).map(([k, v]) => {
                const labels = { ppn: "PPN", category: "家族", lifecycle: "生命周期", title: "标题", latestVersion: "版本", reviewState: "审核", publishState: "发布", owner: "撰写人", update: "更新" };
                // 多选数组显示成 "Buck, Boost (2)"
                let displayVal;
                if (Array.isArray(v)) {
                  if (k === "category") {
                    displayVal = v.map(id => CATEGORY_LABEL_MAP[id] || id).join("、");
                  } else if (k === "reviewState") {
                    const m = { draft: "草稿", review: "审核中", approved: "已通过", rejected: "被拒绝" };
                    displayVal = v.map(x => m[x] || x).join("、");
                  } else if (k === "publishState") {
                    const m = { unpublished: "待发布", published: "已发布", withdrawn: "已撤回" };
                    displayVal = v.map(x => m[x] || x).join("、");
                  } else {
                    displayVal = v.join("、");
                  }
                } else {
                  displayVal = v;
                }
                return (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 bg-[var(--accent-soft)] text-[var(--accent-ink)] text-[11px] font-mono px-1.5 py-0.5 rounded"
                  >
                    <span>{labels[k]}: {displayVal}</span>
                    <button
                      onClick={() => clearColFilter(k)}
                      className="hover:bg-white/40 rounded"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* 横向滚动表格 */}
          <div className="flex-1 overflow-auto scrollbar-thin">
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead className="sticky top-0 z-20">
                <tr>
                  {cols.map((c, i) => {
                    const isFilterable = c.key !== "actions" && c.key !== "preview";
                    const isEnum = ["category", "lifecycle", "reviewState", "publishState"].includes(c.key);
                    const filtered = isColFiltered(c.key);
                    const isOpen = openFilterCol === c.key;

                    return (
                      <th
                        key={i}
                        className={`text-left px-3 py-2.5 border-b border-[var(--border)] font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase font-semibold whitespace-nowrap relative ${
                          c.sticky ? "sticky right-0 z-30" : ""
                        }`}
                        style={{
                          width: colWidths[c.key],
                          minWidth: colWidths[c.key],
                          maxWidth: colWidths[c.key],
                          background: c.sticky ? "#EBE6F4" : "#F4F2FA",
                          boxShadow: c.sticky ? "-6px 0 12px rgba(24,20,38,0.10), -1px 0 0 rgba(24,20,38,0.06)" : "none",
                        }}
                      >
                        <div className="flex items-center gap-1.5 justify-between">
                          <span>{c.label}</span>
                          {isFilterable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenFilterCol(isOpen ? null : c.key);
                              }}
                              className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                filtered
                                  ? "bg-[var(--accent)] text-white"
                                  : "text-[var(--ink-4)] hover:bg-white hover:text-[var(--accent)]"
                              }`}
                              title={filtered ? "筛选已生效,点击调整" : "筛选此列"}
                            >
                              <Filter size={10} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>

                        {/* 筛选 popover */}
                        {isOpen && (
                          <ColumnFilterPopover
                            open={isOpen}
                            onClose={() => setOpenFilterCol(null)}
                            mode={isEnum ? "enum" : "text"}
                            options={isEnum ? computeEnumOptions(c.key) : null}
                            value={colFilters[c.key]}
                            onChange={(v) => {
                              setColFilters(prev => ({ ...prev, [c.key]: v }));
                              setPage(1);
                            }}
                            placeholder={isEnum ? "搜索选项..." : `筛选 ${c.label}...`}
                          />
                        )}

                        {/* 列宽拖拽手柄(每列右侧,sticky 列除外)*/}
                        {!c.sticky && (
                          <div
                            onMouseDown={(e) => startColResize(c.key, e, c.min, c.max)}
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              right: -3,
                              width: 6,
                              cursor: "col-resize",
                              zIndex: 25,
                            }}
                            className="group/resize"
                          >
                            <div
                              className="absolute top-1/4 bottom-1/4 left-1/2 -translate-x-1/2 w-[2px] rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity"
                              style={{
                                background: resizingCol?.key === c.key ? "var(--accent)" : "var(--border-strong)",
                                opacity: resizingCol?.key === c.key ? 1 : undefined,
                              }}
                            />
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pagedDocs.map((d) => {
                  const rb = reviewBadge[d.reviewState] || reviewBadge.draft;
                  const pb = publishBadge[d.publishState] || publishBadge.unpublished;
                  const lc = lifecycleStyle[d.lifecycle];
                  return (
                    <tr key={d.ppn} className="hover:bg-[#FAF8FE] transition-colors group">
                      {/* 1. PPN */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.ppn }}>
                        <span className="font-mono text-[12px] text-[var(--ink)] truncate block">{d.ppn}</span>
                      </td>
                      {/* 2. 产品家族 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.category }}>
                        <span className="text-[12px] text-[var(--ink-2)] truncate block" title={d.category}>{CATEGORY_LABEL_MAP[d.category] || d.category}</span>
                      </td>
                      {/* 3. 生命周期 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.lifecycle }}>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold" style={{ background: lc.bg, color: lc.ink }}>{d.lifecycle}</span>
                      </td>
                      {/* 4. 预览 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.preview }}>
                        <button className="w-7 h-7 rounded-[6px] bg-[#F4F2FA] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)] flex items-center justify-center text-[var(--ink-3)] transition-colors" title="预览 PDF">
                          <Eye size={12} strokeWidth={2.2} />
                        </button>
                      </td>
                      {/* 5. 标题 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] overflow-hidden" style={{ maxWidth: colWidths.title }}>
                        <span className="text-[12px] text-[var(--ink)] block truncate" title={d.title}>{d.title}</span>
                      </td>
                      {/* 6. 版本 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.latestVersion }}>
                        <span className="font-mono text-[12px] text-[var(--ink-2)] truncate block">{d.latestVersion}</span>
                      </td>
                      {/* 7. 审核状态 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.reviewState }}>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold" style={{ background: rb.bg, color: rb.ink }}>{rb.label}</span>
                      </td>
                      {/* 8. 发布状态 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.publishState }}>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold" style={{ background: pb.bg, color: pb.ink }}>{pb.label}</span>
                        {d.publishedVer && <span className="font-mono text-[10px] text-[var(--ink-3)] ml-1">{d.publishedVer}</span>}
                      </td>
                      {/* 9. 撰写人 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.owner }}>
                        <span className="text-[12px] text-[var(--ink-2)] truncate block">{d.owner}</span>
                      </td>
                      {/* 10. 更新时间 */}
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap overflow-hidden" style={{ maxWidth: colWidths.update }}>
                        <span className="text-[12px] text-[var(--ink-3)] font-mono truncate block">{d.update}</span>
                      </td>
                      {/* 11. 操作(sticky,带底色覆盖) */}
                      <td
                        className="px-3 py-2.5 border-b border-[var(--border)] sticky right-0 transition-colors"
                        style={{
                          maxWidth: colWidths.actions,
                          background: "#F4F2FA",
                          boxShadow: "-6px 0 12px rgba(24,20,38,0.08), -1px 0 0 rgba(24,20,38,0.05)",
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-[6px] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)] flex items-center justify-center text-[var(--ink-3)] transition-colors" title="编辑">
                            <PenLine size={12} strokeWidth={2.2} />
                          </button>
                          <button className="w-7 h-7 rounded-[6px] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] flex items-center justify-center text-[var(--ink-3)] transition-colors" title="删除">
                            <X size={13} strokeWidth={2.2} />
                          </button>
                          <button className="w-7 h-7 rounded-[6px] hover:bg-[#EEEAF7] hover:text-[var(--ink)] flex items-center justify-center text-[var(--ink-3)] transition-colors" title="更多">
                            <MoreHorizontal size={13} strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagedDocs.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-[13px] text-[var(--ink-3)] italic">
                      {hasFilter ? (
                        <>
                          没有匹配筛选条件的产品。
                          <button onClick={clearAllFilters} className="ml-2 text-[var(--accent)] hover:underline">清除筛选</button>
                        </>
                      ) : "暂无产品。"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 表格底栏(分页器) */}
          <div className="flex-shrink-0 border-t border-[var(--border)] px-4 h-12 flex items-center justify-between bg-[#F4F2FA] text-[11px] text-[var(--ink-3)] font-mono">
            <span>
              第 {totalCount === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE + 1)} - {Math.min(currentPage * PAGE_SIZE, totalCount)} 条 / 共 {totalCount} 条
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-[#EEEAF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="第一页"
                >«</button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-[#EEEAF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="上一页"
                >‹</button>
                <span className="px-2 text-[var(--ink-2)]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-[#EEEAF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="下一页"
                >›</button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center hover:bg-[#EEEAF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="最后一页"
                >»</button>
              </div>
            )}
            <span>← 横向滚动看更多列 →</span>
          </div>
        </main>
      </div>
    </>
  );
};

// ============================================================
// 11.5 ChangePlanMain — 改动清单主区
//   AI 对比"参考对象"和"用户意图",列出每章需要做什么
// ============================================================
const ChangePlanMain = ({ payload, onEnterEdit }) => {
  const product = payload?.product || "MP1582";
  const projectType = payload?.projectType || "new";
  const targetState = payload?.targetState || "draft";
  const reference = payload?.reference || REFERENCE_LIBRARY[0];
  const [showRefList, setShowRefList] = useState(false);
  // 展开/折叠的章节 id 集合(同时支持多个展开)
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const toggleExpanded = (chId) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const projectTypeLabels = {
    new:     "新产品第一版",
    upgrade: "老版本升级",
    custom:  "客户定制",
  };

  // 难度颜色
  const diffStyle = {
    easy:   { bg: "rgba(46,139,90,0.12)",   ink: "#166534", label: "简单" },
    medium: { bg: "rgba(216,144,32,0.12)",  ink: "#92400E", label: "中等" },
    hard:   { bg: "rgba(220,61,92,0.12)",   ink: "#991B1B", label: "困难" },
  };

  // 内容形态图标
  const typeIcon = {
    text:  PenLine,
    table: Table2,
    image: ImagePlus,
  };

  // AI 协作模式
  const aiModeStyle = {
    auto:   { ink: "var(--lumy-m)", label: "AI 自动",   desc: "AI 直接完成" },
    assist: { ink: "var(--accent)", label: "AI 协作",   desc: "你主导,AI 辅助" },
    manual: { ink: "var(--ink-3)",  label: "手动",      desc: "需要外部数据" },
    skip:   { ink: "var(--ink-4)",  label: "保留",      desc: "无需改动" },
  };

  // 统计
  const stats = {
    total:  CHANGE_PLAN_SAMPLE.length,
    auto:   CHANGE_PLAN_SAMPLE.filter(c => c.ai === "auto").length,
    assist: CHANGE_PLAN_SAMPLE.filter(c => c.ai === "assist").length,
    manual: CHANGE_PLAN_SAMPLE.filter(c => c.ai === "manual").length,
    skip:   CHANGE_PLAN_SAMPLE.filter(c => c.ai === "skip").length,
  };

  return (
    <>
      {/* 顶栏 */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap flex-shrink-0">改动清单</span>
          <span className="text-[var(--border-strong)] flex-shrink-0">·</span>
          <span className="font-mono text-[13px] text-[var(--ink-2)] whitespace-nowrap flex-shrink-0">{product}</span>
          <span
            className="text-[11px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0"
            style={{ background: VERSION_STATES[targetState].bg, color: VERSION_STATES[targetState].ink }}
          >
            {VERSION_STATES[targetState].label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" icon={Eye}>预览</Button>
          <Button variant="primary" size="sm" iconRight={ArrowRight} onClick={onEnterEdit}>开始编辑</Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[820px] mx-auto px-6 py-6">

          {/* 工程信息 */}
          <div className="bg-white border border-[var(--border)] rounded-[12px] p-4 mb-4 anim-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-1">工程类型</div>
                <div className="text-[13px] font-medium text-[var(--ink)]">{projectTypeLabels[projectType]}</div>
              </div>
              <div>
                <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-1">目标版本</div>
                <div className="text-[13px] font-medium text-[var(--ink)]">{VERSION_STATES[targetState].label} <span className="font-mono text-[var(--ink-3)]">({VERSION_STATES[targetState].short})</span></div>
              </div>
              <div>
                <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-1">参考材料</div>
                <button
                  onClick={() => setShowRefList(!showRefList)}
                  className="text-[13px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  {reference.title}
                  <ChevronDown size={11} className={`transition-transform ${showRefList ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
            {showRefList && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-2">AI 找到的相关材料</div>
                <div className="space-y-1.5">
                  {REFERENCE_LIBRARY.map(r => (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-[8px] border ${
                        r.id === reference.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]/40"
                          : "border-[var(--border)] hover:bg-[#EEEAF7]"
                      }`}
                    >
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                        style={{
                          background: r.type === "PRD" ? "rgba(46,139,90,0.12)" : r.type === "datasheet" ? "rgba(59,130,246,0.12)" : "rgba(220,61,92,0.12)",
                          color: r.type === "PRD" ? "#166534" : r.type === "datasheet" ? "#1D4ED8" : "#991B1B",
                        }}
                      >
                        {r.type}
                      </span>
                      <span className="flex-1 text-[12px] text-[var(--ink)] truncate">{r.title}</span>
                      <span className="font-mono text-[11px] text-[var(--ink-3)] flex-shrink-0">{r.size}</span>
                      <span className="font-mono text-[11px] text-[var(--accent)] font-semibold flex-shrink-0">{r.relevance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI 概览卡 */}
          <div className="bg-[var(--accent-soft)]/40 border border-[var(--accent)]/30 rounded-[12px] p-4 mb-4 anim-fade-up" style={{ animationDelay: "250ms" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--accent)] text-white flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[var(--accent-ink)] mb-1.5">AI 已对比 PRD 和 16 章模板</div>
                <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">
                  发现 <strong>{stats.total - stats.skip}</strong> 节需要改动 — 其中 <strong style={{ color: "var(--lumy-m)" }}>{stats.auto} 节</strong> AI 可自动完成,
                  <strong className="text-[var(--accent)]"> {stats.assist} 节</strong> 需要协作,
                  <strong> {stats.manual} 节</strong> 等外部数据。
                  最难的是 <strong>第 3 / 9 / 11 章</strong>(描述/电气参数/功能介绍)。
                </div>
              </div>
            </div>
          </div>

          {/* 改动清单表 */}
          <div className="bg-white border border-[var(--border)] rounded-[12px] overflow-hidden anim-fade-up" style={{ animationDelay: "400ms" }}>
            <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between bg-[#F4F2FA]">
              <span className="font-display text-[13px] font-semibold text-[var(--ink)]">章节改动清单</span>
              <span className="font-mono text-[11px] text-[var(--ink-3)]">共 {stats.total} 章</span>
            </div>
            <div>
              {CHANGE_PLAN_SAMPLE.map((c, i) => {
                const TypeIcon = typeIcon[c.type] || FileText;
                const ds = diffStyle[c.difficulty];
                const ai = aiModeStyle[c.ai];
                const expanded = expandedChapters.has(c.ch);
                const hasExpansion = c.aiSuggestion || c.riskNote;
                return (
                  <div
                    key={c.ch}
                    className={`${
                      i < CHANGE_PLAN_SAMPLE.length - 1 ? "border-b border-[var(--border)]" : ""
                    } ${c.ai === "skip" ? "opacity-50" : ""}`}
                  >
                    {/* 主行 — 可点击展开 */}
                    <div
                      onClick={() => hasExpansion && toggleExpanded(c.ch)}
                      className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                        hasExpansion
                          ? "cursor-pointer hover:bg-[#FAFAFE]"
                          : ""
                      } ${expanded ? "bg-[#FAFAFE]" : ""}`}
                    >
                      <span className="font-mono text-[11px] text-[var(--ink-3)] w-5 flex-shrink-0 mt-0.5">{c.ch}</span>
                      <div className="w-7 h-7 rounded-[6px] bg-[#F4F2FA] flex items-center justify-center flex-shrink-0">
                        <TypeIcon size={12} className="text-[var(--ink-2)]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[13px] font-medium text-[var(--ink)]">{c.name}</span>
                          <span
                            className="text-[11px] font-mono px-1.5 py-0 rounded font-semibold"
                            style={{ background: ds.bg, color: ds.ink }}
                          >
                            {ds.label}
                          </span>
                          {/* 风险提示徽标(在主行就提示) */}
                          {c.riskNote && (
                            <span className="text-[10px] font-mono px-1 py-0 rounded bg-[var(--danger-soft)] text-[var(--danger)] flex items-center gap-0.5">
                              <AlertTriangle size={9} strokeWidth={2.4} />
                              <span>风险</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[var(--ink-2)] leading-snug">{c.diff}</div>
                        {c.note && !expanded && (
                          <div className="text-[11px] text-[var(--ink-3)] mt-1 italic flex items-start gap-1">
                            <Lightbulb size={10} className="flex-shrink-0 mt-0.5 text-[var(--warning)]" />
                            <span>{c.note}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-[11px] font-medium" style={{ color: ai.ink }}>{ai.label}</span>
                        <span className="text-[11px] font-mono text-[var(--ink-3)]">{c.est}</span>
                      </div>
                      {/* 展开图标(只在有可展开内容时显示) */}
                      {hasExpansion && (
                        <ChevronDown
                          size={13}
                          strokeWidth={2}
                          className={`text-[var(--ink-3)] flex-shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </div>

                    {/* 展开内容 */}
                    {expanded && hasExpansion && (
                      <div className="px-4 pb-3 pl-[64px] space-y-2 anim-fade-up">
                        {/* AI 建议 */}
                        {c.aiSuggestion && (
                          <div className="bg-[var(--accent-soft)]/40 border-l-2 border-[var(--accent)] rounded-r-[6px] px-3 py-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Sparkles size={11} strokeWidth={2.2} className="text-[var(--accent-ink)]" />
                              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--accent-ink)]">AI 建议</span>
                            </div>
                            <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">{c.aiSuggestion}</div>
                          </div>
                        )}
                        {/* 注意事项(原 note 字段,展开时显示完整) */}
                        {c.note && (
                          <div className="bg-[#FCEFCB]/40 border-l-2 border-[var(--warning)] rounded-r-[6px] px-3 py-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb size={11} strokeWidth={2.2} className="text-[var(--warning)]" />
                              <span className="font-mono text-[10px] tracking-wider uppercase text-[#92400E]">注意</span>
                            </div>
                            <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">{c.note}</div>
                          </div>
                        )}
                        {/* 风险 */}
                        {c.riskNote && (
                          <div className="bg-[var(--danger-soft)]/50 border-l-2 border-[var(--danger)] rounded-r-[6px] px-3 py-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <AlertTriangle size={11} strokeWidth={2.2} className="text-[var(--danger)]" />
                              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--danger)]">风险提示</span>
                            </div>
                            <div className="text-[12px] text-[var(--ink-2)] leading-relaxed">{c.riskNote}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// ============================================================
// 12. ReportMain — 检查报告主区
// ============================================================
const ReportMain = ({ payload }) => {
  const product = payload?.product || "MP1582";

  const issues = [
    { sev: "warn",  ch: "第 3 节 描述",        msg: "包含营销词「easy-to-use」",     suggestion: "TI 风格建议改为具体数值或动作描述" },
    { sev: "info",  ch: "第 3 节 描述",        msg: "缺少测试条件",                  suggestion: "建议补充「at TA = 25°C, VIN = 12V」" },
    { sev: "warn",  ch: "第 9 节 电气参数",    msg: "PG 阈值 Min/Max 缺失",          suggestion: "新增的 PG 行需要补 Min/Max,等量产数据回填" },
    { sev: "error", ch: "第 14 节 订购信息",   msg: "OPN 命名违反企业规范",          suggestion: "应符合 MP1582xx-LF-Z 格式" },
    { sev: "info",  ch: "第 16 节 免责声明",   msg: "缺少「不适用于生命支持」声明",  suggestion: "已自动从模板补全,请确认" },
  ];

  const counts = {
    error: issues.filter(i => i.sev === "error").length,
    warn:  issues.filter(i => i.sev === "warn").length,
    info:  issues.filter(i => i.sev === "info").length,
  };

  const sevStyle = {
    error: { ink: "var(--danger)",  bg: "var(--danger-soft)",  label: "错误" },
    warn:  { ink: "var(--warning)", bg: "var(--warning-soft)", label: "警告" },
    info:  { ink: "var(--info)",    bg: "var(--info-soft)",    label: "提示" },
  };

  return (
    <>
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap flex-shrink-0">检查报告</span>
          <span className="text-[var(--border-strong)] flex-shrink-0">·</span>
          <span className="font-mono text-[13px] font-semibold text-[var(--ink)] whitespace-nowrap flex-shrink-0">{product}</span>
          <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] text-[11px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">v1.0-rc1</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" icon={Eye}>查看</Button>
          <Button variant="primary" size="sm" icon={Sparkles}>让 AI 修</Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[760px] mx-auto px-6 py-6">
          {/* 总体状态 */}
          <div className="bg-white border border-[var(--border)] rounded-[12px] p-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[12px] bg-[var(--warning-soft)] flex items-center justify-center flex-shrink-0">
                <CircleAlert size={22} className="text-[var(--warning)]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-[18px] font-semibold text-[var(--ink)] leading-tight mb-0.5">
                  发现 {issues.length} 处需要处理
                </h2>
                <div className="text-[12px] text-[var(--ink-2)]">
                  AI 用 「TI 写作风格 + 企业术语 + 行业合规」3 套规则扫描了全部 16 节
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "error", label: "错误",   count: counts.error, style: sevStyle.error,  desc: "必须修复" },
                { key: "warn",  label: "警告",   count: counts.warn,  style: sevStyle.warn,   desc: "建议修复" },
                { key: "info",  label: "提示",   count: counts.info,  style: sevStyle.info,   desc: "供参考" },
              ].map(s => (
                <div
                  key={s.key}
                  className="rounded-[10px] px-3.5 py-2.5"
                  style={{ background: s.style.bg }}
                >
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="font-display text-[18px] font-bold leading-none" style={{ color: s.style.ink }}>{s.count}</span>
                    <span className="text-[12px] font-medium" style={{ color: s.style.ink }}>{s.label}</span>
                  </div>
                  <div className="text-[11px]" style={{ color: s.style.ink, opacity: 0.75 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 详细列表 */}
          <div className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase mb-2 px-1">
            详细问题清单
          </div>
          <div className="space-y-2">
            {issues.map((it, i) => {
              const s = sevStyle[it.sev];
              return (
                <div
                  key={i}
                  className="bg-white border border-[var(--border)] rounded-[10px] px-4 py-3 flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: s.bg }}
                  >
                    {it.sev === "error" && <AlertCircle size={12} style={{ color: s.ink }} />}
                    {it.sev === "warn" && <CircleAlert size={12} style={{ color: s.ink }} />}
                    {it.sev === "info" && <Lightbulb size={12} style={{ color: s.ink }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider font-semibold" style={{ color: s.ink }}>
                        {s.label}
                      </span>
                      <span className="text-[11px] text-[var(--ink-3)]">{it.ch}</span>
                    </div>
                    <div className="text-[13px] text-[var(--ink)] mb-1 leading-snug">{it.msg}</div>
                    <div className="text-[12px] text-[var(--ink-2)] leading-snug">— {it.suggestion}</div>
                  </div>
                  <button className="text-[12px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1 flex-shrink-0 mt-0.5">
                    <Sparkles size={10} />
                    让 AI 修
                  </button>
                </div>
              );
            })}
          </div>

          {/* 规则配置 */}
          <div className="bg-white border border-[var(--border)] rounded-[12px] p-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-[14px] font-semibold text-[var(--ink)]">检查规则配置</h3>
                <div className="text-[11px] text-[var(--ink-3)] mt-0.5">勾选要启用的规则组,下次检查会按此运行</div>
              </div>
              <Button variant="ghost" size="sm" icon={Settings}>规则库</Button>
            </div>
            <div className="space-y-3">
              {CHECK_RULES.map(g => (
                <div key={g.group} className="border border-[var(--border)] rounded-[8px] overflow-hidden">
                  <div className="px-3 py-2 bg-[#F4F2FA] flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[var(--ink)]">{g.group}</span>
                    <span className="text-[11px] font-mono text-[var(--ink-3)]">{g.rules.filter(r => r.on).length}/{g.rules.length} 已启用</span>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {g.rules.map(r => (
                      <div key={r.id} className="px-3 py-2 flex items-start gap-3 hover:bg-[#FAFAFE] transition-colors">
                        <div
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            r.on ? "bg-[var(--accent)]" : "border border-[var(--border-strong)]"
                          }`}
                        >
                          {r.on && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[var(--ink)]">{r.name}</div>
                          <div className="text-[11px] text-[var(--ink-3)] mt-0.5">{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 竞品对比 */}
          <div className="bg-white border border-[var(--border)] rounded-[12px] p-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-[14px] font-semibold text-[var(--ink)]">竞品对比报告</h3>
                <div className="text-[11px] text-[var(--ink-3)] mt-0.5">AI 已对比 TI / MPS 同类产品的关键参数</div>
              </div>
              <Button variant="ghost" size="sm" icon={BarChart3}>详细报告</Button>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">参数</th>
                    <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase font-semibold" style={{ color: "var(--accent)" }}>{product}</th>
                    <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">MP1482 (上一代)</th>
                    <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">TI TPS54302</th>
                    <th className="text-left py-2 px-2 font-mono text-[11px] tracking-wider uppercase text-[var(--ink-3)] font-semibold">评估</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { p: "VIN 范围",    self: "4.5-20V",   prev: "4.75-18V", comp: "4.5-28V",  verdict: "等" },
                    { p: "IOUT 最大",   self: "3 A",       prev: "2 A",      comp: "3 A",      verdict: "等" },
                    { p: "效率峰值",    self: "95%",       prev: "93%",      comp: "94%",      verdict: "优" },
                    { p: "RDS(ON)",     self: "100 mΩ",    prev: "130 mΩ",   comp: "100/95 mΩ", verdict: "等" },
                    { p: "开关频率",    self: "600 kHz",   prev: "340 kHz",  comp: "600 kHz",  verdict: "等" },
                    { p: "Power Good",  self: "✓ 内置",    prev: "✗",        comp: "✓",        verdict: "等" },
                    { p: "封装",        self: "SOIC8E/QFN9", prev: "SOIC8/8E", comp: "WSON8",   verdict: "优" },
                  ].map((r, i, arr) => {
                    const verdictStyle = {
                      "优": { bg: "rgba(46,139,90,0.12)",  ink: "#166534" },
                      "等": { bg: "rgba(168,163,188,0.20)", ink: "var(--ink-3)" },
                      "弱": { bg: "rgba(220,61,92,0.12)",   ink: "#991B1B" },
                    }[r.verdict];
                    return (
                      <tr key={i} className={i < arr.length - 1 ? "border-b border-[var(--border)]" : ""}>
                        <td className="py-2 px-2 text-[12px] text-[var(--ink-2)]">{r.p}</td>
                        <td className="py-2 px-2 font-mono text-[12px] font-semibold text-[var(--ink)]">{r.self}</td>
                        <td className="py-2 px-2 font-mono text-[12px] text-[var(--ink-3)]">{r.prev}</td>
                        <td className="py-2 px-2 font-mono text-[12px] text-[var(--ink-3)]">{r.comp}</td>
                        <td className="py-2 px-2">
                          <span
                            className="font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: verdictStyle.bg, color: verdictStyle.ink }}
                          >
                            {r.verdict}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--ink-2)] leading-relaxed">
              <Sparkles size={10} className="inline mr-1 text-[var(--accent)]" />
              <strong>AI 建议:</strong> 相比 MP1482 全面升级 — IOUT +50%、频率提升至 600kHz、新增 PG。跟 TI TPS54302 持平,但 SOIC8E + 3x3 QFN 双封装策略提供更广客户选择,可在描述中作为差异化卖点。
            </div>
          </div>
        </div>
      </main>
    </>
  );
};


// ============================================================
// 11.6 ReviewInboxMain — 待我审核(用户视角的审核任务列表)
// ============================================================
const ReviewInboxMain = ({ payload }) => {
  const currentUser = useCurrentUser();
  // 数据按当前角色取 — 不同角色看到不同的 inbox
  const items = REVIEW_INBOX[currentUser.id] || [];

  return (
    <>
      {/* 顶栏 */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap">收件箱</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap">待我审核</span>
          <span className="bg-[var(--warning-soft)] text-[#92400E] text-[11px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">{items.length} 项待办</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[820px] mx-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 size={32} className="mx-auto text-[var(--success)] mb-3" strokeWidth={1.5} />
              <div className="text-[14px] text-[var(--ink-2)] mb-1">没有待审项</div>
              <div className="text-[12px] text-[var(--ink-3)]">所有指派给你的审核任务都已处理完毕</div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="bg-white border border-[var(--border)] rounded-[12px] p-3.5 hover:border-[var(--accent)] transition-colors anim-fade-up overflow-hidden"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* 卡片头部 — 内容区域(自适应) */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="font-mono text-[14px] font-semibold text-[var(--ink)]">{item.ppn}</span>
                      <span className="font-mono text-[12px] text-[var(--ink-2)]">{item.version}</span>
                      <span className="bg-[var(--accent-soft)] text-[var(--accent-ink)] text-[11px] font-mono px-1.5 py-0.5 rounded">{item.type}</span>
                    </div>
                    <div className="text-[13px] text-[var(--ink)] leading-snug mb-1.5 break-words">{item.summary}</div>
                    {/* 元信息 — 用 flex-wrap 多行排列 */}
                    <div className="text-[11px] text-[var(--ink-3)] flex items-center gap-x-2 gap-y-1 flex-wrap">
                      <span className="whitespace-nowrap">提交人:<span className="text-[var(--ink-2)]">{item.submitter}</span></span>
                      <span className="text-[var(--border-strong)]">·</span>
                      <span className="whitespace-nowrap">{item.submittedAt}</span>
                      <span className="text-[var(--border-strong)]">·</span>
                      <span className="whitespace-nowrap">{item.changedChapters}/{item.chapters} 章有改动</span>
                    </div>
                  </div>

                  {/* 操作按钮 — 也支持换行 */}
                  <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[var(--border)] flex-wrap">
                    <Button variant="ghost" size="sm" icon={Eye}>预览</Button>
                    <Button variant="ghost" size="sm" icon={GitBranch}>看改动</Button>
                    <div className="flex-1 min-w-0" />
                    <Button variant="ghost" size="sm" icon={X}>驳回</Button>
                    <Button variant="primary" size="sm" icon={Check}>通过</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};


// ============================================================
// 11.7 PublishInboxMain — 待我发布(用户视角的发布任务列表)
// ============================================================
const PublishInboxMain = ({ payload }) => {
  const currentUser = useCurrentUser();
  // 数据按当前角色取 — 不同角色看到不同的 inbox
  const items = PUBLISH_INBOX[currentUser.id] || [];

  return (
    <>
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap">收件箱</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap">待我发布</span>
          <span className="bg-[var(--success-soft)] text-[#166534] text-[11px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">{items.length} 项</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[820px] mx-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 size={32} className="mx-auto text-[var(--success)] mb-3" strokeWidth={1.5} />
              <div className="text-[14px] text-[var(--ink-2)] mb-1">没有待发布项</div>
              <div className="text-[12px] text-[var(--ink-3)]">所有审批通过的手册都已发布</div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="bg-white border border-[var(--border)] rounded-[12px] p-3.5 hover:border-[var(--accent)] transition-colors anim-fade-up overflow-hidden"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="font-mono text-[14px] font-semibold text-[var(--ink)]">{item.ppn}</span>
                      <span className="font-mono text-[12px] text-[var(--ink-2)]">{item.version}</span>
                      <span className="bg-[var(--success-soft)] text-[#166534] text-[11px] font-mono px-1.5 py-0.5 rounded">已审批通过</span>
                    </div>
                    <div className="text-[13px] text-[var(--ink)] leading-snug mb-1.5 break-words">{item.summary}</div>
                    <div className="text-[11px] text-[var(--ink-3)] flex items-center gap-x-2 gap-y-1 flex-wrap">
                      <span className="whitespace-nowrap">审批人:<span className="text-[var(--ink-2)]">{item.approver}</span></span>
                      <span className="text-[var(--border-strong)]">·</span>
                      <span className="whitespace-nowrap">通过时间:{item.approvedAt}</span>
                    </div>
                    {item.changeNotes && (
                      <div className="mt-2 text-[12px] text-[var(--ink-2)] bg-[#F4F2FA] px-3 py-2 rounded-[8px] break-words">
                        <span className="font-mono text-[10px] text-[var(--ink-3)] mr-1.5">改动摘要:</span>
                        {item.changeNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[var(--border)] flex-wrap">
                    <Button variant="ghost" size="sm" icon={Eye}>预览 PDF</Button>
                    <div className="flex-1 min-w-0" />
                    <Button variant="ghost" size="sm" icon={Undo2}>撤回</Button>
                    <Button variant="ghost" size="sm" icon={Send}>发布到分销商</Button>
                    <Button variant="primary" size="sm" icon={Globe}>发布到官网</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};


// ============================================================
// HistoryTableMain — 通用历史 table(审核历史 / 发布历史共享)
// ============================================================
const HistoryTableMain = ({ type }) => {
  // type: "review" | "publish"
  const currentUser = useCurrentUser();
  const isReview = type === "review";
  const userField = isReview ? "reviewer" : "publisher";
  // 只看当前用户操作过的记录
  const allRecords = HISTORY_RECORDS
    .filter(r => r.type === type && r[userField] === currentUser.name)
    .sort((a, b) => b.timestamp - a.timestamp);
  const [actionFilter, setActionFilter] = useState("all");
  const [openComment, setOpenComment] = useState(null);  // { record } | null

  // 列宽 state
  const cols = isReview
    ? [
        { key: "ppn",        label: "PPN",        def: 130, min: 100, max: 200 },
        { key: "title",      label: "产品标题",   def: 280, min: 180, max: 480 },
        { key: "version",    label: "版本",       def: 80,  min: 60,  max: 120 },
        { key: "submitter",  label: "提交人",     def: 90,  min: 70,  max: 140 },
        { key: "action",     label: "操作",       def: 100, min: 80,  max: 140 },
        { key: "when",       label: "时间",       def: 130, min: 100, max: 180 },
        { key: "comment",    label: "审核意见",   def: 110, min: 90,  max: 160, sticky: true },
      ]
    : [
        { key: "ppn",        label: "PPN",        def: 130, min: 100, max: 200 },
        { key: "title",      label: "产品标题",   def: 280, min: 180, max: 480 },
        { key: "version",    label: "版本",       def: 80,  min: 60,  max: 120 },
        { key: "channels",   label: "渠道",       def: 160, min: 100, max: 220 },
        { key: "action",     label: "操作",       def: 100, min: 80,  max: 140 },
        { key: "when",       label: "时间",       def: 130, min: 100, max: 180 },
        { key: "comment",    label: "发布说明",   def: 110, min: 90,  max: 160, sticky: true },
      ];

  const [colWidths, setColWidths] = useState(() => {
    const obj = {};
    cols.forEach(c => { obj[c.key] = c.def; });
    return obj;
  });
  const [resizingCol, setResizingCol] = useState(null);

  useEffect(() => {
    if (!resizingCol) return;
    const { key, startX, startWidth, min, max } = resizingCol;
    const onMove = (e) => {
      const dx = e.clientX - startX;
      const newWidth = Math.max(min, Math.min(max, startWidth + dx));
      setColWidths(prev => ({ ...prev, [key]: newWidth }));
    };
    const onUp = () => setResizingCol(null);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizingCol]);

  const startColResize = (key, e, min, max) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol({ key, startX: e.clientX, startWidth: colWidths[key], min, max });
  };

  // 应用 action 筛选
  const records = actionFilter === "all" ? allRecords : allRecords.filter(r => r.action === actionFilter);

  // tab 数据
  const tabConfig = isReview
    ? [
        { id: "all",      label: `全部 ${allRecords.length}` },
        { id: "approved", label: `已通过 ${allRecords.filter(r => r.action === "approved").length}` },
        { id: "rejected", label: `被拒绝 ${allRecords.filter(r => r.action === "rejected").length}` },
      ]
    : [
        { id: "all",       label: `全部 ${allRecords.length}` },
        { id: "released",  label: `已发布 ${allRecords.filter(r => r.action === "released").length}` },
        { id: "withdrawn", label: `已撤回 ${allRecords.filter(r => r.action === "withdrawn").length}` },
      ];

  const actionStyle = isReview
    ? { approved: { label: "已通过", bg: "#E5F5EC", ink: "#166534" }, rejected: { label: "被拒绝", bg: "#FBE5EA", ink: "#991B1B" } }
    : { released: { label: "已发布", bg: "#E5F5EC", ink: "#166534" }, withdrawn: { label: "已撤回", bg: "#F4F2FA", ink: "#6B6680" } };

  return (
    <>
      {/* 顶栏 */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap">收件箱</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap">
            {isReview ? "审核历史" : "发布历史"}
          </span>
          <span className="font-mono text-[11px] text-[var(--ink-3)] whitespace-nowrap">共 {allRecords.length} 条</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {tabConfig.map(t => (
            <button
              key={t.id}
              onClick={() => setActionFilter(t.id)}
              className={`px-2.5 h-7 rounded-[6px] text-[12px] font-mono transition-colors ${
                actionFilter === t.id
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--ink-3)] hover:bg-[#F4F2FA]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* table 区 */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead className="sticky top-0 z-20">
              <tr>
                {cols.map((c, i) => (
                  <th
                    key={i}
                    className={`text-left px-3 py-2.5 border-b border-[var(--border)] font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase font-semibold whitespace-nowrap relative ${
                      c.sticky ? "sticky right-0 z-30" : ""
                    }`}
                    style={{
                      width: colWidths[c.key],
                      minWidth: colWidths[c.key],
                      maxWidth: colWidths[c.key],
                      background: c.sticky ? "#EBE6F4" : "#F4F2FA",
                      boxShadow: c.sticky ? "-6px 0 12px rgba(24,20,38,0.10), -1px 0 0 rgba(24,20,38,0.06)" : "none",
                    }}
                  >
                    {c.label}
                    {!c.sticky && (
                      <div
                        onMouseDown={(e) => startColResize(c.key, e, c.min, c.max)}
                        style={{ position: "absolute", top: 0, bottom: 0, right: -3, width: 6, cursor: "col-resize", zIndex: 25 }}
                        className="group/resize"
                      >
                        <div
                          className="absolute top-1/4 bottom-1/4 left-1/2 -translate-x-1/2 w-[2px] rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity"
                          style={{ background: resizingCol?.key === c.key ? "var(--accent)" : "var(--border-strong)" }}
                        />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const a = actionStyle[r.action] || { label: r.action, bg: "#F4F2FA", ink: "#6B6680" };
                return (
                  <tr key={r.id} className="hover:bg-[#FAF8FE] transition-colors group">
                    <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.ppn }}>
                      <span className="font-mono text-[12px] text-[var(--ink)] truncate block">{r.ppn}</span>
                    </td>
                    <td className="px-3 py-2.5 border-b border-[var(--border)] overflow-hidden" style={{ maxWidth: colWidths.title }}>
                      <span className="text-[12px] text-[var(--ink)] block truncate" title={r.productTitle}>{r.productTitle}</span>
                    </td>
                    <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.version }}>
                      <span className="font-mono text-[12px] text-[var(--ink-2)]">{r.version}</span>
                    </td>
                    {isReview ? (
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.submitter }}>
                        <span className="text-[12px] text-[var(--ink-2)]">{r.submitter}</span>
                      </td>
                    ) : (
                      <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.channels }}>
                        <div className="flex items-center gap-1 flex-wrap">
                          {(r.channels || []).map(ch => (
                            <span key={ch} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent-ink)]">
                              {CHANNEL_LABEL_MAP[ch] || ch}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.action }}>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold" style={{ background: a.bg, color: a.ink }}>
                        {a.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border-b border-[var(--border)] whitespace-nowrap" style={{ maxWidth: colWidths.when }}>
                      <span className="font-mono text-[11px] text-[var(--ink-3)]">{r.when}</span>
                    </td>
                    {/* sticky 操作列:看意见按钮 */}
                    <td
                      className="px-3 py-2.5 border-b border-[var(--border)] sticky right-0"
                      style={{
                        maxWidth: colWidths.comment,
                        background: "#F4F2FA",
                        boxShadow: "-6px 0 12px rgba(24,20,38,0.08), -1px 0 0 rgba(24,20,38,0.05)",
                      }}
                    >
                      <button
                        onClick={() => setOpenComment(r)}
                        className="px-2 h-7 rounded-[6px] text-[11px] text-[var(--accent-ink)] hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1"
                      >
                        <Eye size={11} strokeWidth={2.2} />
                        {isReview ? "看意见" : "看说明"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={cols.length} className="px-4 py-12 text-center text-[13px] text-[var(--ink-3)] italic">
                    没有此类记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 表格底栏 */}
        <div className="flex-shrink-0 border-t border-[var(--border)] px-4 h-12 flex items-center justify-between bg-[#F4F2FA] text-[11px] text-[var(--ink-3)] font-mono">
          <span>共 {records.length} 条</span>
          <span>← 横向滚动看更多列 →</span>
        </div>
      </main>

      {/* 弹窗 — 看意见 */}
      {openComment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 anim-fade-up"
          onClick={() => setOpenComment(null)}
        >
          <div
            className="bg-white rounded-[12px] shadow-2xl max-w-[520px] w-[90%] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗顶栏 */}
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">{openComment.ppn}</span>
                <span className="font-mono text-[12px] text-[var(--ink-2)]">{openComment.version}</span>
                {(() => {
                  const a = actionStyle[openComment.action];
                  return a ? (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: a.bg, color: a.ink }}>
                      {a.label}
                    </span>
                  ) : null;
                })()}
              </div>
              <IconButton icon={X} onClick={() => setOpenComment(null)} title="关闭" size="sm" />
            </div>

            {/* 弹窗主体 */}
            <div className="px-5 py-4">
              <div className="text-[13px] text-[var(--ink-2)] mb-3">{openComment.productTitle}</div>
              <div className="text-[11px] font-mono text-[var(--ink-3)] mb-2 tracking-wider uppercase">
                {isReview ? (openComment.action === "approved" ? "通过意见" : "驳回原因") : "发布说明"}
              </div>
              <div
                className="text-[13px] text-[var(--ink)] leading-relaxed px-3 py-2.5 rounded-[8px]"
                style={{
                  background: openComment.action === "approved" || openComment.action === "released" ? "#F4F8F6" : "#FCF3F4",
                  borderLeft: `3px solid ${openComment.action === "approved" || openComment.action === "released" ? "#86c8a3" : "#e8a3ad"}`,
                }}
              >
                {openComment.comment || "(无)"}
              </div>

              {/* 元信息 */}
              <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-3 text-[12px]">
                {isReview && (
                  <>
                    <div>
                      <div className="font-mono text-[10px] text-[var(--ink-3)] mb-0.5">提交人</div>
                      <div className="text-[var(--ink-2)]">{openComment.submitter}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[var(--ink-3)] mb-0.5">审核人</div>
                      <div className="text-[var(--ink-2)]">{openComment.reviewer}</div>
                    </div>
                  </>
                )}
                {!isReview && (
                  <>
                    <div>
                      <div className="font-mono text-[10px] text-[var(--ink-3)] mb-0.5">发布人</div>
                      <div className="text-[var(--ink-2)]">{openComment.publisher}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[var(--ink-3)] mb-0.5">发布渠道</div>
                      <div className="text-[var(--ink-2)]">
                        {(openComment.channels || []).map(ch => CHANNEL_LABEL_MAP[ch] || ch).join("、")}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <div className="font-mono text-[10px] text-[var(--ink-3)] mb-0.5">时间</div>
                  <div className="text-[var(--ink-2)]">{openComment.when}</div>
                </div>
              </div>
            </div>

            {/* 弹窗底栏 */}
            <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setOpenComment(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ReviewHistoryMain = () => <HistoryTableMain type="review" />;
const PublishHistoryMain = () => <HistoryTableMain type="publish" />;


// ============================================================
// 11.10 WritingDoingMain — 写作中(操作记录流卡片样式)
// ============================================================
const WritingDoingMain = () => {
  const currentUser = useCurrentUser();
  // 数据:当前用户的 draft / review / rejected 产品
  const myDocs = ALL_PRODUCTS
    .filter(p => p.owner === currentUser.name)
    .filter(p => ["draft", "review", "rejected"].includes(p.reviewState))
    .sort((a, b) => (a._daysAgo || 0) - (b._daysAgo || 0))
    .slice(0, 30);  // 最多 30 条

  const stateBadge = {
    draft:    { label: "草稿",   bg: "#F4F2FA", ink: "#6B6680", icon: PenLine },
    review:   { label: "审核中", bg: "#FCEFCB", ink: "#92400E", icon: Loader2 },
    rejected: { label: "被拒绝", bg: "#FBE5EA", ink: "#991B1B", icon: X },
  };

  return (
    <>
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between gap-3 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-wider uppercase whitespace-nowrap">写作中心</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span className="font-display text-[14px] font-semibold text-[var(--ink)] whitespace-nowrap">写作中</span>
          <span className="font-mono text-[11px] text-[var(--ink-3)] whitespace-nowrap">共 {myDocs.length} 项</span>
        </div>
        <Button variant="primary" size="sm" icon={Plus}>新建手册</Button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[820px] mx-auto px-6 py-6">
          {myDocs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-[14px] text-[var(--ink-2)] mb-1">暂无写作中的手册</div>
              <div className="text-[12px] text-[var(--ink-3)]">点右上角"新建手册"开始</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myDocs.map((d, i) => {
                const sb = stateBadge[d.reviewState];
                const Icon = sb.icon;
                const docDetails = getDocDetails(d);
                const progress = computeChapterProgress(docDetails.chapters);
                const lastMod = getLastModified(docDetails.chapters);
                return (
                  <div
                    key={d.ppn}
                    className="bg-white border border-[var(--border)] rounded-[10px] p-3.5 hover:border-[var(--border-strong)] transition-colors anim-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[13px] font-semibold text-[var(--ink)]">{d.ppn}</span>
                          <span className="font-mono text-[12px] text-[var(--ink-2)]">{d.latestVersion}</span>
                          <span
                            className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: sb.bg, color: sb.ink }}
                          >
                            {sb.label}
                          </span>
                          <span
                            className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: lifecycleStyleStatic[d.lifecycle]?.bg || "#F4F2FA", color: lifecycleStyleStatic[d.lifecycle]?.ink || "#6B6680" }}
                          >
                            {d.lifecycle}
                          </span>
                          <span
                            className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: docTypeStyleStatic[d.docType]?.bg || "#F4F2FA", color: docTypeStyleStatic[d.docType]?.ink || "#6B6680" }}
                          >
                            {d.docType || "初始版"}
                          </span>
                        </div>
                        <div className="text-[12px] text-[var(--ink-2)] mt-1 leading-snug">{d.title}</div>
                        <div className="text-[11px] text-[var(--ink-3)] mt-1.5 flex items-center gap-1.5 flex-wrap font-mono">
                          <span>分类 <span className="text-[var(--ink-2)]">{CATEGORY_LABEL_MAP[d.category] || d.category}</span></span>
                          <span className="text-[var(--border-strong)]">·</span>
                          <span>更新 {d.update}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" icon={PenLine}>继续写作</Button>
                        {d.reviewState === "draft" && (
                          <button className="w-7 h-7 rounded-[6px] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] flex items-center justify-center text-[var(--ink-3)] transition-colors" title="删除草稿">
                            <X size={13} strokeWidth={2.2} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 章节进度 — 4 段堆叠条 + 数字 + 最后修改 */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-[var(--ink-3)]">章节进度</span>
                        <span className="font-mono">
                          <span className="text-[var(--success)] font-semibold">{progress.done}</span>
                          <span className="text-[var(--ink-3)]"> / {progress.total} 章</span>
                          <span className="text-[var(--border-strong)] mx-1">·</span>
                          <span className="text-[var(--ink-2)] font-medium">{progress.percent}%</span>
                        </span>
                      </div>
                      <div className="flex h-[5px] rounded-full overflow-hidden bg-[#F4F2FA]" title={`已完成 ${progress.done} · 写作中 ${progress.inProgress} · 需复核 ${progress.warn} · 空白 ${progress.empty}`}>
                        {progress.done > 0 && (
                          <div style={{ width: `${(progress.done / progress.total) * 100}%`, background: CHAPTER_STATUS.done.dot }} />
                        )}
                        {progress.inProgress > 0 && (
                          <div style={{ width: `${(progress.inProgress / progress.total) * 100}%`, background: CHAPTER_STATUS["in-progress"].dot }} />
                        )}
                        {progress.warn > 0 && (
                          <div style={{ width: `${(progress.warn / progress.total) * 100}%`, background: CHAPTER_STATUS.warn.dot }} />
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--ink-3)]">
                        <div className="flex items-center gap-2 font-mono">
                          {progress.inProgress > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full" style={{ background: CHAPTER_STATUS["in-progress"].dot }} />
                              {progress.inProgress} 写作中
                            </span>
                          )}
                          {progress.warn > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full" style={{ background: CHAPTER_STATUS.warn.dot }} />
                              {progress.warn} 需复核
                            </span>
                          )}
                          {progress.empty > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full" style={{ background: CHAPTER_STATUS.empty.dot }} />
                              {progress.empty} 空白
                            </span>
                          )}
                        </div>
                        {lastMod && (
                          <div className="font-mono">
                            最后修改 <span className="text-[var(--ink-2)]">{lastMod.modifier}</span> · {lastMod.at}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

// 静态生命周期样式(给 WritingDoingMain 用,因为它在 DocListMain 外面)
const lifecycleStyleStatic = {
  "在研":   { bg: "rgba(59, 130, 246, 0.1)",  ink: "#1D4ED8" },
  "改版中": { bg: "rgba(216, 144, 32, 0.1)",  ink: "#92400E" },
  "量产":   { bg: "rgba(46, 139, 90, 0.1)",   ink: "#166534" },
  "EOL":    { bg: "rgba(107, 102, 128, 0.1)", ink: "#6B6680" },
};

// 手册类型样式
const docTypeStyleStatic = {
  "初始版": { bg: "rgba(88, 71, 204, 0.08)",  ink: "#3A23B0" },
  "改版":   { bg: "rgba(216, 144, 32, 0.10)", ink: "#92400E" },
  "定制版": { bg: "rgba(168, 85, 247, 0.10)", ink: "#7C3AED" },
};


// ============================================================
// 11.11 PlatformMain / TemplatesMain — 占位主区
// ============================================================
const PlatformMain = () => (
  <>
    <header className="h-14 border-b border-[var(--border)] flex items-center gap-3 px-4 flex-shrink-0">
      <Library size={16} className="text-[var(--accent)]" />
      <span className="font-display text-[14px] font-semibold text-[var(--ink)]">平台库</span>
      <span className="text-[var(--border-strong)]">·</span>
      <span className="font-mono text-[11px] text-[var(--ink-3)]">字段 / 术语 / 素材</span>
    </header>
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[820px] mx-auto px-6 py-12">
        <div className="text-center">
          <Library size={48} className="mx-auto text-[var(--border-strong)] mb-4" strokeWidth={1.5} />
          <div className="font-display text-[18px] text-[var(--ink)] mb-2">平台库 · Coming Soon</div>
          <div className="text-[13px] text-[var(--ink-2)] leading-relaxed max-w-[420px] mx-auto">
            统一管理产品字段定义、电源 IC 行业术语、应用图素材、参考电路图等可复用资源,
            为 Datapilot AI 提供权威知识基础。
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-[600px] mx-auto">
            {[
              { icon: FileText,  label: "字段定义",  count: "120+" },
              { icon: PenLine,   label: "术语库",    count: "300+" },
              { icon: FolderOpen, label: "素材库",  count: "80+" },
            ].map((it, i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-[10px] p-4 text-left">
                <it.icon size={16} className="text-[var(--accent)] mb-2" />
                <div className="text-[13px] font-medium text-[var(--ink)]">{it.label}</div>
                <div className="text-[11px] text-[var(--ink-3)] font-mono mt-0.5">{it.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </>
);

const TemplatesMain = () => (
  <>
    <header className="h-14 border-b border-[var(--border)] flex items-center gap-3 px-4 flex-shrink-0">
      <ClipboardCheck size={16} className="text-[var(--accent)]" />
      <span className="font-display text-[14px] font-semibold text-[var(--ink)]">模板库</span>
      <span className="text-[var(--border-strong)]">·</span>
      <span className="font-mono text-[11px] text-[var(--ink-3)]">企业模板 + Lumy 共享</span>
    </header>
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[820px] mx-auto px-6 py-12">
        <div className="text-center">
          <ClipboardCheck size={48} className="mx-auto text-[var(--border-strong)] mb-4" strokeWidth={1.5} />
          <div className="font-display text-[18px] text-[var(--ink)] mb-2">模板库 · Coming Soon</div>
          <div className="text-[13px] text-[var(--ink-2)] leading-relaxed max-w-[420px] mx-auto">
            包含华东芯片企业内部 datasheet 模板,以及 Lumy 平台跨企业共享的优质模板。
            新建产品手册时一键应用。
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-[480px] mx-auto">
            {[
              { label: "企业 Buck v2.3",     pinned: true,  hint: "华东芯片标准模板" },
              { label: "企业 LDO v1.8",      pinned: true,  hint: "华东芯片标准模板" },
              { label: "Lumy · TI 风格",     pinned: false, hint: "社区共享" },
              { label: "Lumy · ADI 风格",   pinned: false, hint: "社区共享" },
            ].map((it, i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-[10px] p-3.5 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-[var(--ink)]">{it.label}</span>
                  {it.pinned && <Pin size={11} className="text-[var(--accent)]" />}
                </div>
                <div className="text-[11px] text-[var(--ink-3)]">{it.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </>
);

// 模拟对话历史(为 LeftSidebar 用)
// ============================================================
// 数据层 — 版本状态 / 工程类型 / 参考材料 / 检查规则
// ============================================================

// 5 个版本状态
const VERSION_STATES = {
  draft:  { label: "初始版",  short: "draft",  bg: "var(--accent-soft)",  ink: "var(--accent-ink)",  desc: "撰写中,未交付" },
  alpha:  { label: "送样版",  short: "alpha",  bg: "rgba(216,144,32,0.15)", ink: "#92400E",          desc: "跟样片一起给销售/AE,小范围测试" },
  beta:   { label: "小批版",  short: "beta",   bg: "rgba(59,130,246,0.15)", ink: "#1D4ED8",          desc: "关键客户预览,可能还要改" },
  ga:     { label: "正式版",  short: "GA",     bg: "rgba(46,139,90,0.15)",  ink: "#166534",          desc: "公开发布,稳定不再大改" },
  custom: { label: "客户专版", short: "custom", bg: "rgba(142,55,214,0.15)", ink: "#5B26A3",          desc: "某客户专版,基于正式版派生" },
};

// 工程类型
const PROJECT_TYPES = [
  { id: "new",     label: "新产品第一版",  icon: "Sparkles", desc: "基于 PRD 起草",       refType: "PRD" },
  { id: "upgrade", label: "老版本升级",     icon: "PenLine",  desc: "在上一版基础上改",   refType: "datasheet" },
  { id: "custom",  label: "客户定制",       icon: "GitBranch", desc: "基于正式版派生专版", refType: "datasheet" },
];

// 参考材料库(MP1582 项目的智能检索结果)
const REFERENCE_LIBRARY = [
  // PRD 类
  { id: "prd-1",   type: "PRD",       title: "MP1582 立项 PRD v0.3",                product: "MP1582", date: "4 月 28 日", size: "16 页", relevance: 96, tags: ["Buck", "3A", "20V", "PG 引脚"] },
  { id: "prd-2",   type: "PRD",       title: "下一代 Buck 产品线规划 (FY26)",        product: "Buck 产品线", date: "3 月 10 日", size: "24 页", relevance: 78, tags: ["Buck", "Roadmap"] },
  // 旧版 datasheet — 重点是 MP1482
  { id: "ds-1",    type: "datasheet", title: "MP1482 v1.2 (MPS, 2A 18V Buck)",      product: "MP1482", date: "2010-01-13", size: "13 页", relevance: 96, tags: ["Buck", "2A", "18V", "SOIC8", "已发布"] },
  { id: "ds-2",    type: "datasheet", title: "MP1484 v1.0 (MPS, 3A 18V Buck)",      product: "MP1484", date: "2012-06-01", size: "14 页", relevance: 88, tags: ["Buck", "3A", "18V", "SOIC8E"] },
  { id: "ds-3",    type: "datasheet", title: "MP2451 v1.1 (MPS, 1A 18V Buck)",      product: "MP2451", date: "2014-09-15", size: "12 页", relevance: 65, tags: ["Buck", "1A"] },
  // 竞品参考
  { id: "comp-1",  type: "竞品",      title: "TI TPS54302 datasheet (3A, 28V)",     product: "竞品 TI",  date: "—",          size: "32 页", relevance: 84, tags: ["竞品", "TI", "3A"] },
  { id: "comp-2",  type: "竞品",      title: "TI TPS563231 datasheet (3A, 17V)",    product: "竞品 TI",  date: "—",          size: "26 页", relevance: 79, tags: ["竞品", "TI"] },
];

// 改动清单(MP1582 基于 MP1482 升级,16 章逐项分析)
//
// 字段说明:
//   ch / name / type        — 章节编号、名称、内容形态
//   diff                     — 改动概要(主显示)
//   difficulty               — easy / medium / hard
//   ai                       — auto(自动) / assist(协作) / manual(手动) / skip(无需改动)
//   est                      — 预估耗时
//   note                     — 难点/注意事项("黄色灯泡"显示)
//   aiSuggestion             — AI 准备好的具体动作话术(点开章节后展示)
//   riskNote                 — 潜在风险/合规提示(红色)
const CHANGE_PLAN_SAMPLE = [
  { ch: "1",  name: "标题",         type: "text",  diff: "MP1482 → MP1582,2A → 3A,18V → 20V",                            difficulty: "easy",   ai: "auto",     est: "1 分钟",
    aiSuggestion: "已识别 5 处替换:PPN、IOUT 标称、VIN 上限、副标题中的频率、芯片类型描述。直接套模板生成。" },
  { ch: "2",  name: "特点",         type: "text",  diff: "新增 PG 引脚条目,IOUT/RDS(ON)/频率/效率 4 处数据更新",          difficulty: "medium", ai: "assist",   est: "5 分钟",
    aiSuggestion: "我会保留 MP1482 的 11 项 features,新增第 12 项「Power Good Indicator」并把 IOUT、RDS(ON)、频率、效率四处数据替换为 MP1582 的实测值。",
    riskNote: "PG 描述要避开「open-drain comparator」字样,客户视角下叙述为「外部信号通知主控芯片」。" },
  { ch: "3",  name: "描述",         type: "text",  diff: "重写突出 PG + 600kHz + 95% 效率 + 9 引脚封装",                  difficulty: "hard",   ai: "assist",   est: "15 分钟", note: "功能原理软描述,深浅尺度需要把握 — 提到 PG 但不暴露内部比较器实现",
    aiSuggestion: "已起草 3 版描述供你选:A 偏技术(强调架构)/ B 偏应用(强调省外围)/ C 偏卖点(强调 95% 效率)。建议选 B,跟客户使用场景对齐。",
    riskNote: "MP1482 老描述有 1 处营销词「easy-to-use」需删,TI 风格规范不允许。" },
  { ch: "4",  name: "典型应用",     type: "text",  diff: "拓展应用场景:新增 5G 设备 / SSD / 工业自动化",                difficulty: "easy",   ai: "auto",     est: "2 分钟",
    aiSuggestion: "MP1482 原有 4 项(POL、机顶盒、路由器、监控),新增 3 项贴合 600kHz 高频优势(5G CPE、企业级 SSD、工业 PLC)。" },
  { ch: "5",  name: "应用电路",     type: "image", diff: "新增 PG 引脚连接,加 10kΩ 上拉电阻和 PG 信号输出",              difficulty: "medium", ai: "assist",   est: "15 分钟", note: "需从素材库找带 PG 的 buck 参考电路",
    aiSuggestion: "在素材库找到 3 个候选参考图(TPS54824 / LM3150 / LMR62421),建议基于 LMR62421 改 — 拓扑最接近,只需改 PPN、加一个 10kΩ 上拉到 VOUT。",
    riskNote: "原 MP1482 应用图里电感标 4.7μH,新标 3.3μH(频率从 340kHz 升到 600kHz 后纹波目标),需要测试组确认 BOM。" },
  { ch: "6",  name: "封装信息",     type: "image", diff: "封装从 SOIC8 升级到 SOIC8E (Exposed Pad) + 新增 3x3 QFN-9",     difficulty: "medium", ai: "auto",     est: "5 分钟",
    aiSuggestion: "我从封装库直接调 SOIC8E 和 QFN-9 的标准尺寸图,生成两版封装信息页。Exposed Pad 标 GND,QFN 中心标 GND PAD。" },
  { ch: "7",  name: "极限参数",     type: "table", diff: "VIN 上限 20V → 21V,Switch Node 21V → 24V,新增 PG -0.3V 到 +6V", difficulty: "easy",   ai: "auto",     est: "3 分钟",
    aiSuggestion: "已对齐 TI 模板 8 行结构:VIN / VSW / VEN / VBOOT / VFB / VPG(新增)/ Tj / TSTG。所有 absolute max 比 recommended 上限留 1V 余量。" },
  { ch: "8",  name: "推荐参数",     type: "table", diff: "VIN 工作范围 4.5–20V,VOUT 0.6–17V",                            difficulty: "easy",   ai: "auto",     est: "2 分钟",
    aiSuggestion: "VOUT 下限按 VFB(0.6V)给出,上限按 90% 占空比保守估算 = 0.9 × 19V ≈ 17V。已校验 Tj 范围与极限参数表自洽。" },
  { ch: "9",  name: "电气参数",     type: "table", diff: "全表更新 + 增加 2 行 PG 项,VFB 0.923V → 0.6V,RDSON 130 → 100mΩ", difficulty: "hard",   ai: "assist",   est: "30 分钟", note: "需要等量产数据回填,AI 整理 Min/Typ/Max 三栏并校验单位",
    aiSuggestion: "我已搭好 33 行表格框架,标记了 11 行需量产实测数据(VFB tolerance、ICC、ILEAK、PG 阈值等),其余 22 行从设计参数推算。等测试组数据 → 一键填入。",
    riskNote: "VFB 从 0.923V 改 0.6V 是 datasheet 重大变更,需要 PE 单独签字。已发起 issue tracker 单号 PE-2024-1138。" },
  { ch: "10", name: "曲线性能图",   type: "image", diff: "全部重测:效率峰值 93% → 95%,频率特性图新增,负载瞬态新增",     difficulty: "hard",   ai: "manual",   est: "等数据",  note: "实验室回测,AI 无法生成,要等测试组",
    aiSuggestion: "数据到位后,我可以从 raw CSV 自动生成 6 张标准曲线图(效率 vs 输出电流 × 3 个 VIN、负载瞬态 × 2 个 VOUT、频率响应)。",
    riskNote: "测试组排期 5 月 8 日 - 14 日。如果赶送样,曲线图可标 PRELIMINARY 先发 alpha 版。" },
  { ch: "11", name: "功能介绍",     type: "text",  diff: "新增 Power Good 功能章节,客户视角描述",                       difficulty: "hard",   ai: "assist",   est: "20 分钟", note: "最难章节 — 站在客户角度写,既要让 FAE 能讲清楚,又不能暴露内部 IP",
    aiSuggestion: "已起草 PG 段落 3 版:A 250 字偏教学(适合教育市场)/ B 180 字偏使用(主推)/ C 120 字偏精简(放 features 之上)。建议选 B 入正文 + C 进 features。",
    riskNote: "原版本 MP1482 的「current-mode control」原理段保留,但内部比较器架构不能写。法务初审已过(Ref. LR-2024-0521)。" },
  { ch: "12", name: "应用指南",     type: "text",  diff: "新增 PG 引脚使用说明 + 开漏输出连接示例",                      difficulty: "medium", ai: "assist",   est: "10 分钟",
    aiSuggestion: "在 MP1482 原有的电感选型 / 输入输出电容章节后,新增一节「PG 引脚使用」:解释开漏特性、推荐上拉值(2.2kΩ-10kΩ)、典型连接(MCU RESET_N、FPGA POR)。" },
  { ch: "13", name: "PCB 应用指南", type: "image", diff: "新增 PG 引脚布线建议,Exposed Pad 散热焊盘 footprint",          difficulty: "medium", ai: "auto",     est: "5 分钟",
    aiSuggestion: "Exposed Pad 焊盘 IPC-7351 标准生成 4×4 通孔阵列(20 mils)散热到底部 GND 平面。PG 走线避开 SW 节点,远离开关回路。" },
  { ch: "14", name: "订购信息",     type: "table", diff: "OPN 重新生成:MP1582DN-LF-Z (SOIC8E) / MP1582GD-LF-Z (QFN)",    difficulty: "easy",   ai: "auto",     est: "2 分钟",
    aiSuggestion: "按企业 OPN 规范生成 2 行:MP1582DN-LF-Z(SOIC8E,卷盘 2500/卷)、MP1582GD-LF-Z(QFN-9,卷盘 3000/卷)。MOQ、价格梯度、交付周期已查 ERP 同步过来。" },
  { ch: "15", name: "POD 图纸",     type: "image", diff: "封装变更后重新出 SOIC8E 和 3x3 QFN-9 两份 POD",                difficulty: "hard",   ai: "manual",   est: "等封装组",
    aiSuggestion: "封装组排期 5 月 6 日交首版 POD。我可以监听文件夹,POD 一进来就自动嵌入到本节。",
    riskNote: "QFN-9 的 lead pitch 0.5mm,客户 PCB 工艺要求 4 层板 / Class 3,需在应用指南补充提示。" },
  { ch: "16", name: "免责声明",     type: "text",  diff: "保留 MP1482 标准声明",                                          difficulty: "easy",   ai: "skip",     est: "—",
    aiSuggestion: "无需改动 — 沿用 TI 标准免责模板 v3.2。" },
];

// 版本树(MP1482 真实演进 + MP1582 在写)
const VERSION_TREE_SAMPLE = {
  product: "MP1482 / MP1582",
  versions: [
    { id: "v0.1",  label: "MP1482 v0.1", state: "draft",  date: "2009-08-15", author: "陈悦",   note: "MP1482 初稿,2A 18V 同步整流 buck" },
    { id: "v1.0a", label: "MP1482 v1.0", state: "alpha",  date: "2009-10-22", author: "陈悦",   note: "送样版,EN/SS 引脚定义敲定" },
    { id: "v1.1b", label: "MP1482 v1.1", state: "beta",   date: "2009-12-08", author: "陈悦",   note: "小批版,修订软启动时序到 15ms" },
    { id: "v1.2",  label: "MP1482 v1.2", state: "ga",     date: "2010-01-13", author: "陈悦",   note: "MP1482 正式发布,15 年量产记录" },
    { id: "mp1582-v0.1", label: "MP1582 v0.1", state: "draft",  date: "2026-04-28", author: "张文远", note: "基于 MP1482 v1.2 升级:3A / 20V / 600kHz / 加 PG", current: true },
    { id: "mp1582-v1.0-aliyun", label: "custom-阿里云", state: "custom", date: "派生自 MP1582 v1.0", author: "陈悦", note: "(规划中)阿里云 SSD 专版,RoHS 严格要求" },
  ],
};

// 检查规则配置
const CHECK_RULES = [
  { group: "术语", rules: [
    { id: "term-1", name: "TI 风格术语", desc: "禁用 'easy-to-use' 等营销词", on: true },
    { id: "term-2", name: "企业自定义术语", desc: "符合华东芯片术语表", on: true },
  ]},
  { group: "数据", rules: [
    { id: "data-1", name: "电气参数完整性", desc: "Min/Typ/Max 三栏必填", on: true },
    { id: "data-2", name: "测试条件标注",   desc: "至少有 TA = 25°C, VIN 标注", on: true },
    { id: "data-3", name: "单位规范",       desc: "符合 SI / IEEE / TI 标准",  on: true },
  ]},
  { group: "合规", rules: [
    { id: "comp-1", name: "免责声明",       desc: "包含'不适用于生命支持'", on: true },
    { id: "comp-2", name: "出口管制标识",   desc: "ECCN / HTS 等",         on: false },
  ]},
  { group: "竞品对比", rules: [
    { id: "comp-3", name: "关键参数对标",   desc: "对比 TI / MPS 同类产品", on: true },
  ]},
];


// ============================================================
// 1000 个 TI 电源管理 IC 产品 — 按真实命名规则与分类生成
// ============================================================

// TI 真实分类(对应官网导航)
// category 用 leaf id,parent 关系在 categoryTree 里维护
const TI_CATEGORIES = [
  { id: "buck",       parent: "dcdc",    name: "Buck 降压", weight: 25 },
  { id: "boost",      parent: "dcdc",    name: "Boost 升压", weight: 8 },
  { id: "buckboost",  parent: "dcdc",    name: "Buck-Boost 升降压", weight: 5 },
  { id: "module",     parent: "dcdc",    name: "DC/DC 电源模块", weight: 6 },
  { id: "ldo",        parent: "linear",  name: "LDO 线性稳压器", weight: 18 },
  { id: "pmic_ddr",   parent: "pmic",    name: "DDR 内存电源", weight: 3 },
  { id: "pmic_soc",   parent: "pmic",    name: "处理器 PMIC", weight: 7 },
  { id: "charger",    parent: "battery", name: "充电管理 IC", weight: 6 },
  { id: "gauge",      parent: "battery", name: "电量计", weight: 3 },
  { id: "protect",    parent: "battery", name: "电池保护", weight: 2 },
  { id: "flyback",    parent: "acdc",    name: "反激控制器", weight: 3 },
  { id: "pfc",        parent: "acdc",    name: "PFC 控制器", weight: 2 },
  { id: "llc",        parent: "acdc",    name: "LLC 谐振", weight: 2 },
  { id: "gate_hb",    parent: "gate",    name: "半桥驱动", weight: 3 },
  { id: "gate_lo",    parent: "gate",    name: "低边驱动", weight: 2 },
  { id: "gate_iso",   parent: "gate",    name: "隔离驱动", weight: 2 },
  { id: "lswitch",    parent: "switch",  name: "负载开关", weight: 4 },
  { id: "supervisor", parent: "supr",    name: "电源监控/复位", weight: 3 },
];

// PPN 前缀规则(TI 真实命名风格)
const PPN_RULES = {
  buck:       [["TPS54", 4], ["TPS56", 4], ["TPS62", 4], ["LM5", 4], ["LM2", 4], ["LMR16", 3], ["LMR33", 3]],
  boost:      [["TPS61", 3], ["LM27", 3], ["LMR62", 3]],
  buckboost: [["LM517", 2], ["LM5175", 2], ["TPS63", 3]],
  module:     [["LMZM", 4], ["LMZ31", 3], ["TPSM8", 3]],
  ldo:        [["TPS7A", 4], ["TPS74", 3], ["LP38", 3], ["LM317", 1], ["LM78", 2], ["TLV70", 3], ["TLV71", 3]],
  pmic_ddr:   [["TPS51", 3], ["TPS53", 3]],
  pmic_soc:   [["TPS65", 4], ["LP87", 3], ["TPS6521", 2]],
  charger:    [["BQ24", 4], ["BQ25", 4], ["TPS25", 4]],
  gauge:      [["BQ27", 4], ["BQ40", 3], ["BQ34Z", 3]],
  protect:    [["BQ29", 3], ["BQ77", 3], ["BQ76", 3]],
  flyback:    [["UCC28", 3], ["UCC288", 2]],
  pfc:        [["UCC28", 3], ["UCC2", 3]],
  llc:        [["UCC256", 2], ["UCC25", 3]],
  gate_hb:    [["UCC215", 2], ["UCC273", 2], ["LM510", 2]],
  gate_lo:    [["UCC275", 3], ["LMG10", 3]],
  gate_iso:   [["UCC215", 3], ["UCC2154", 2], ["AMC120", 2]],
  lswitch:    [["TPS22", 4], ["TPS25", 3], ["TPS274", 2]],
  supervisor: [["TPS386", 2], ["TPS38", 3], ["TLV80", 3]],
};

// 标题模板 — 按 TI 风格
const TI_TITLE_TEMPLATES = {
  buck:       ["{a}A {v}V 同步降压转换器", "{a}A {v}V 集成 FET Buck", "宽 VIN {a}A 同步 Buck", "高效 {a}A 降压(集成 MOSFET)", "{f}kHz 同步 Buck {a}A", "{a}A 工业级 Buck", "汽车级 {a}A 同步 Buck", "{a}A {v}V 单芯片降压"],
  boost:      ["{a}A 同步升压转换器", "电池驱动 {v}V 升压 IC", "{a}A 高效 Boost", "{f}kHz 同步 Boost", "升压控制器(外置 FET)"],
  buckboost: ["4 开关 Buck-Boost 控制器", "{a}A 同步 Buck-Boost", "宽 VIN Buck-Boost {a}A", "I2C 可调 Buck-Boost", "汽车级 Buck-Boost {v}V"],
  module:     ["{a}A {v}V 集成电感电源模块", "PoL 电源模块 {a}A", "高密度 DC/DC 模块 {a}A", "汽车级 {a}A 电源模块"],
  ldo:        ["{a}A {v}V 超低噪声 LDO", "{vout}V {a}mA 固定输出 LDO", "{a}mA 低 IQ 线性稳压器", "汽车级 LDO {a}mA", "高 PSRR LDO {a}A", "{a}mA 模拟 LDO(超低噪声)"],
  pmic_ddr:   ["DDR3/4 终端稳压器", "{a}A DDR 电源 IC", "DDR5 内存电源管理"],
  pmic_soc:   ["{n} 路 SoC PMIC", "汽车级处理器 PMIC", "可编程多路 PMIC", "FPGA 专用 PMIC"],
  charger:    ["{a}A 单节锂电池充电管理", "USB-PD 快充 IC {a}A", "多化学体系电池充电", "{a}A 同步 Buck 充电器", "无线充电管理 IC"],
  gauge:      ["{n} 串电池电量计(I2C)", "Impedance Track 电量计", "{n}S 锂电池监测 + 电量计"],
  protect:    ["{n}S 锂电池保护 IC", "高边电池保护 + 监测", "锂电池组前端保护"],
  flyback:    ["反激控制器(集成 GaN)", "原边调节反激控制", "高频反激控制器", "适配器反激 IC"],
  pfc:        ["有源 PFC 控制器", "数字 PFC 控制 IC", "图腾柱 PFC 控制器"],
  llc:        ["{f}kHz LLC 谐振控制器", "高频 LLC 控制 IC", "数字 LLC 控制器"],
  gate_hb:    ["{a}A 半桥栅极驱动", "高低边驱动 {a}A", "高速半桥驱动器"],
  gate_lo:    ["{a}A 单通道低边驱动", "双通道低边栅极驱动"],
  gate_iso:   ["增强隔离半桥驱动", "{a}A 隔离栅极驱动", "汽车级隔离驱动"],
  lswitch:    ["{a}A 负载开关", "USB 端口保护开关", "高边负载开关 {a}A", "汽车级负载开关"],
  supervisor: ["{n} 路电源监控 IC", "电源时序监控", "复位 IC + 看门狗"],
};

const PRODUCT_OWNERS = ["张文远", "陈悦", "李志强", "王晓敏", "刘建华", "吴静", "周伟", "孙琳", "赵明轩", "马晨曦"];

const LIFECYCLE_DIST = [
  { v: "在研",   w: 15 },
  { v: "量产",   w: 60 },
  { v: "改版中", w: 15 },
  { v: "EOL",    w: 10 },
];
const REVIEW_DIST = [
  { v: "draft",    w: 20 },
  { v: "review",   w: 15 },
  { v: "approved", w: 60 },
  { v: "rejected", w: 5 },
];
const PUBLISH_DIST = [
  { v: "unpublished", w: 25 },
  { v: "published",   w: 65 },
  { v: "withdrawn",   w: 10 },
];

function pickWeighted(items, rand) {
  const total = items.reduce((s, it) => s + it.w, 0);
  let r = rand * total;
  for (const it of items) {
    if (r < it.w) return it.v;
    r -= it.w;
  }
  return items[items.length - 1].v;
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateProducts(count = 993) {
  const rand = seededRandom(42);
  const products = [];
  const ppnSet = new Set();

  // 把分类按权重展开
  const categoryPool = [];
  TI_CATEGORIES.forEach(c => {
    for (let k = 0; k < c.weight; k++) categoryPool.push(c.id);
  });

  for (let i = 0; i < count; i++) {
    const category = categoryPool[Math.floor(rand() * categoryPool.length)];

    // PPN 生成
    const rules = PPN_RULES[category];
    const rule = rules[Math.floor(rand() * rules.length)];
    const [prefix, digits] = rule;
    let ppn;
    let tries = 0;
    do {
      const numLen = digits;
      let num = "";
      for (let d = 0; d < numLen; d++) num += Math.floor(rand() * 10);
      const suffix = rand() > 0.85 ? String.fromCharCode(65 + Math.floor(rand() * 5)) : "";
      ppn = `${prefix}${num}${suffix}`;
      tries++;
    } while (ppnSet.has(ppn) && tries < 10);
    if (ppnSet.has(ppn)) ppn = `${ppn}-${i}`;
    ppnSet.add(ppn);

    const lifecycle = pickWeighted(LIFECYCLE_DIST, rand());

    let reviewState = pickWeighted(REVIEW_DIST, rand());
    if (lifecycle === "EOL") reviewState = "approved";
    if (lifecycle === "在研" && reviewState === "approved") {
      reviewState = rand() > 0.5 ? "draft" : "review";
    }

    let publishState;
    let publishedVer = null;
    if (reviewState === "draft" || reviewState === "review" || reviewState === "rejected") {
      publishState = "unpublished";
    } else {
      publishState = pickWeighted(PUBLISH_DIST, rand());
      if (publishState === "published" || publishState === "withdrawn") {
        const major = Math.floor(rand() * 3) + 1;
        const minor = Math.floor(rand() * 5);
        publishedVer = `v${major}.${minor}`;
      }
    }
    if (lifecycle === "EOL") {
      publishState = rand() > 0.3 ? "withdrawn" : "published";
      if (!publishedVer) publishedVer = `v${Math.floor(rand() * 2) + 1}.${Math.floor(rand() * 5)}`;
    }

    let latestVersion;
    if (reviewState === "draft") {
      latestVersion = `v0.${Math.floor(rand() * 5) + 1}`;
    } else if (reviewState === "review") {
      latestVersion = `v${Math.floor(rand() * 2)}.${Math.floor(rand() * 5)}`;
    } else if (publishedVer) {
      const newer = rand() > 0.7;
      if (newer) {
        const [maj, min] = publishedVer.replace("v", "").split(".").map(Number);
        latestVersion = `v${maj}.${min + 1}`;
      } else {
        latestVersion = publishedVer;
      }
    } else {
      latestVersion = `v${Math.floor(rand() * 2) + 1}.${Math.floor(rand() * 5)}`;
    }

    // 标题(按家族模板)
    const templates = TI_TITLE_TEMPLATES[category] || ["通用电源 IC"];
    const tpl = templates[Math.floor(rand() * templates.length)];
    const a = (Math.floor(rand() * 30) + 1) + (rand() > 0.5 ? "." + Math.floor(rand() * 9) : "");
    const v = Math.floor(rand() * 60) + 5;
    const vout = (Math.floor(rand() * 5) + 1) + "." + Math.floor(rand() * 9);
    const f = [340, 500, 600, 800, 1000, 1500, 2000][Math.floor(rand() * 7)];
    const n = [2, 3, 4, 6, 8, 16][Math.floor(rand() * 6)];
    const title = tpl
      .replace("{a}", a).replace("{v}", v).replace("{vout}", vout)
      .replace("{f}", f).replace("{n}", n);

    const owner = PRODUCT_OWNERS[Math.floor(rand() * PRODUCT_OWNERS.length)];

    const daysAgo = Math.floor(rand() * 365);
    let update;
    if (daysAgo === 0) update = "今天";
    else if (daysAgo === 1) update = "昨天";
    else if (daysAgo < 7) update = `${daysAgo} 天前`;
    else if (daysAgo < 30) update = `${Math.floor(daysAgo / 7)} 周前`;
    else if (daysAgo < 365) update = `${Math.floor(daysAgo / 30)} 月前`;
    else update = "1 年前";

    // 手册类型 — 70% 初始版,20% 改版,10% 定制版
    let docType;
    const dr = rand();
    if (dr < 0.70) docType = "初始版";
    else if (dr < 0.90) docType = "改版";
    else docType = "定制版";
    // 改版中的产品强制为"改版"
    if (lifecycle === "改版中") docType = "改版";

    products.push({
      ppn, category, lifecycle, title, latestVersion, docType,
      reviewState, publishState, publishedVer, owner, update, _daysAgo: daysAgo,
    });
  }
  return products;
}

// 真实存在的 TI 产品(手写)
const HANDCRAFTED_PRODUCTS = [
  { ppn: "TPS54824",  category: "buck",     lifecycle: "在研",   docType: "初始版", title: "8A 28V 同步降压转换器(集成 FET)", latestVersion: "v0.1",  reviewState: "review",     reviewer: "陈悦",  publishState: "unpublished",                     owner: "张文远", update: "今天",   _daysAgo: 0 },
  { ppn: "TPS563200", category: "buck",     lifecycle: "量产",   docType: "改版",   title: "3A 17V 同步降压(D-CAP2 控制)",    latestVersion: "v1.2",  reviewState: "approved",                      publishState: "published",   publishedVer: "v1.2", owner: "陈悦",   update: "1 年前", _daysAgo: 365 },
  { ppn: "TPS62130",  category: "buck",     lifecycle: "改版中", docType: "改版",   title: "3A 17V 高效 Buck(DCS-Control)",   latestVersion: "v1.1",  reviewState: "review",     reviewer: "张文远", publishState: "published",   publishedVer: "v1.0", owner: "陈悦",   update: "今天",   _daysAgo: 0 },
  { ppn: "TPS562201", category: "buck",     lifecycle: "量产",   docType: "初始版", title: "2A 17V 同步降压(D-CAP2)",          latestVersion: "v1.0",  reviewState: "approved",                      publishState: "published",   publishedVer: "v1.0", owner: "张文远", update: "2 月前", _daysAgo: 60 },
  { ppn: "TPS7A4501", category: "ldo",      lifecycle: "量产",   docType: "改版",   title: "1A 36V 超低噪声 LDO",                latestVersion: "v1.1",  reviewState: "approved",                      publishState: "published",   publishedVer: "v1.1", owner: "张文远", update: "3 天前", _daysAgo: 3 },
  { ppn: "LM5117",    category: "buck",     lifecycle: "量产",   docType: "改版",   title: "宽 VIN 电流模式 Buck 控制器",        latestVersion: "v2.0",  reviewState: "approved",                      publishState: "published",   publishedVer: "v2.0", owner: "陈悦",   update: "1 周前", _daysAgo: 7 },
  { ppn: "LM2596",    category: "buck",     lifecycle: "EOL",    docType: "初始版", title: "3A 经典 Step-Down 开关稳压器",        latestVersion: "v0.9",  reviewState: "approved",                      publishState: "withdrawn",   publishedVer: "v0.9", owner: "陈悦",   update: "1 年前", _daysAgo: 365 },
  { ppn: "BQ24617",   category: "charger",  lifecycle: "量产",   docType: "定制版", title: "多化学体系单节锂电池充电管理",         latestVersion: "v1.3",  reviewState: "approved",                      publishState: "published",   publishedVer: "v1.3", owner: "李志强", update: "2 周前", _daysAgo: 14 },
  { ppn: "TPS65217",  category: "pmic_soc", lifecycle: "量产",   docType: "初始版", title: "PMIC: 3 DC/DC + 4 LDO + 充电器",       latestVersion: "v1.2",  reviewState: "approved",                      publishState: "published",   publishedVer: "v1.2", owner: "王晓敏", update: "1 月前", _daysAgo: 30 },
];

const ALL_PRODUCTS = [
  ...HANDCRAFTED_PRODUCTS,
  ...generateProducts(1000 - HANDCRAFTED_PRODUCTS.length),
];


// ============================================================
// 操作历史记录 — 张文远的审核 + 发布操作历史
// ============================================================
//
// 每条记录:
//   type: "review" | "publish"
//   ppn / productTitle / version: 产品信息
//   reviewer / publisher: 操作人(全部 = 张文远)
//   submitter: 提交人(审核记录里有,发布记录里也有)
//   action / channels: 具体操作
//   comment: 审核意见或发布说明
//   timestamp: 时间戳(用于排序)
//   when: 显示用的时间字符串
// ============================================================

// 真实存在的产品引用(从 HANDCRAFTED_PRODUCTS 取)
const HISTORY_RECORDS = [
  // === 审核历史(张文远审核过的)— 18 条 ===
  { id: "h-r01", type: "review", ppn: "TPS54824",  productTitle: "8A 28V 同步降压转换器(集成 FET)", version: "v0.1", action: "approved", reviewer: "张文远", submitter: "陈悦",   comment: "电气表与原版一致,描述清晰,通过", when: "今天 14:30",  timestamp: Date.now() - 4*3600*1000 },
  { id: "h-r02", type: "review", ppn: "TPS563200", productTitle: "3A 17V D-CAP2 同步降压",            version: "v1.1", action: "rejected", reviewer: "张文远", submitter: "陈悦",   comment: "应用图缺少关键去耦电容标注,bode 图需补充相位裕度数据", when: "今天 11:20",  timestamp: Date.now() - 7*3600*1000 },
  { id: "h-r03", type: "review", ppn: "TPS62130",  productTitle: "3A 17V DCS-Control 低噪声 Buck",   version: "v1.0", action: "approved", reviewer: "张文远", submitter: "李志强", comment: "通过,DCS-Control 章节描述准确",         when: "昨天 16:48",  timestamp: Date.now() - 28*3600*1000 },
  { id: "h-r04", type: "review", ppn: "TPS562201", productTitle: "2A 17V D-CAP2 经济型 Buck",          version: "v1.0", action: "approved", reviewer: "张文远", submitter: "李志强", comment: "通过", when: "昨天 14:15",  timestamp: Date.now() - 30*3600*1000 },
  { id: "h-r05", type: "review", ppn: "LM5117",    productTitle: "宽 VIN 75V 电流模式 Buck Controller",version: "v2.0", action: "approved", reviewer: "张文远", submitter: "陈悦",   comment: "电流模式控制章节补全,通过",  when: "昨天 10:30",  timestamp: Date.now() - 34*3600*1000 },
  { id: "h-r06", type: "review", ppn: "BQ24617",   productTitle: "多化学体系单节锂电池充电管理",        version: "v1.3", action: "approved", reviewer: "张文远", submitter: "李志强", comment: "通过",                                  when: "3 天前",       timestamp: Date.now() - 3*24*3600*1000 },
  { id: "h-r07", type: "review", ppn: "TPS65217",  productTitle: "PMIC: 3 DC/DC + 4 LDO + 充电器",     version: "v1.2", action: "approved", reviewer: "张文远", submitter: "王晓敏", comment: "PMIC 时序图清晰,通过",                  when: "4 天前",       timestamp: Date.now() - 4*24*3600*1000 },
  { id: "h-r08", type: "review", ppn: "TPS7A4501", productTitle: "1A 36V 超低噪声 LDO",               version: "v1.1", action: "rejected", reviewer: "张文远", submitter: "刘建华", comment: "PSRR 曲线图分辨率不足,频率轴标注错误,需重新绘制", when: "5 天前",       timestamp: Date.now() - 5*24*3600*1000 },
  { id: "h-r09", type: "review", ppn: "LM2596",    productTitle: "经典 3A Step-Down(EOL)",            version: "v0.9", action: "approved", reviewer: "张文远", submitter: "陈悦",   comment: "EOL 标记完整,最终版通过",               when: "1 周前",       timestamp: Date.now() - 7*24*3600*1000 },
  { id: "h-r10", type: "review", ppn: "TPS54424",  productTitle: "4A 28V 同步降压(汽车级)",            version: "v1.0", action: "approved", reviewer: "张文远", submitter: "陈悦",   comment: "AEC-Q100 数据完整,通过",                 when: "1 周前",       timestamp: Date.now() - 8*24*3600*1000 },
  { id: "h-r11", type: "review", ppn: "TPS563231", productTitle: "3A 17V Buck(D-CAP3)",               version: "v0.5", action: "rejected", reviewer: "张文远", submitter: "周伟",   comment: "效率曲线测试条件不明确,需补 Vin/Iout 标注", when: "10 天前",      timestamp: Date.now() - 10*24*3600*1000 },
  { id: "h-r12", type: "review", ppn: "LP38798",   productTitle: "1A 超低噪声可调 LDO",                 version: "v1.0", action: "approved", reviewer: "张文远", submitter: "吴静",   comment: "通过,噪声数据详细",                      when: "2 周前",       timestamp: Date.now() - 14*24*3600*1000 },
  { id: "h-r13", type: "review", ppn: "BQ25770",   productTitle: "4S 锂电池充电管理(USB-PD)",          version: "v1.1", action: "approved", reviewer: "张文远", submitter: "孙琳",   comment: "USB-PD 协议描述清晰,通过",              when: "2 周前",       timestamp: Date.now() - 15*24*3600*1000 },
  { id: "h-r14", type: "review", ppn: "TPS22918",  productTitle: "2A 单通道负载开关",                    version: "v1.0", action: "approved", reviewer: "张文远", submitter: "马晨曦", comment: "通过",                                   when: "3 周前",       timestamp: Date.now() - 21*24*3600*1000 },
  { id: "h-r15", type: "review", ppn: "UCC27517",  productTitle: "4A 单通道低边栅极驱动",                version: "v1.0", action: "approved", reviewer: "张文远", submitter: "李志强", comment: "应用电路完整,通过",                       when: "3 周前",       timestamp: Date.now() - 22*24*3600*1000 },
  { id: "h-r16", type: "review", ppn: "TPS54424",  productTitle: "汽车级 4A Buck(改版)",               version: "v1.1", action: "rejected", reviewer: "张文远", submitter: "赵明轩", comment: "AEC 等级表标注与新版芯片实测数据冲突,需复核",         when: "1 月前",       timestamp: Date.now() - 30*24*3600*1000 },
  { id: "h-r17", type: "review", ppn: "TPS61299",  productTitle: "5A 同步升压转换器",                    version: "v0.8", action: "approved", reviewer: "张文远", submitter: "周伟",   comment: "通过",                                   when: "1 月前",       timestamp: Date.now() - 32*24*3600*1000 },
  { id: "h-r18", type: "review", ppn: "TPS65072",  productTitle: "便携设备 PMIC",                        version: "v1.0", action: "approved", reviewer: "张文远", submitter: "陈悦",   comment: "通过,PMIC 集成度章节完整",               when: "1 月前",       timestamp: Date.now() - 34*24*3600*1000 },

  // === 发布历史(张文远发布过的)— 16 条 ===
  { id: "h-p01", type: "publish", ppn: "TPS54824",  productTitle: "8A 28V 同步降压转换器(集成 FET)", version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发,同步发布到官网与分销商", when: "今天 16:45", timestamp: Date.now() - 2*3600*1000 },
  { id: "h-p02", type: "publish", ppn: "TPS62130",  productTitle: "3A 17V DCS-Control 低噪声 Buck",   version: "v1.1", action: "released", channels: ["website"],                publisher: "张文远", comment: "更新到 v1.1,仅官网更新",      when: "昨天 11:30", timestamp: Date.now() - 30*3600*1000 },
  { id: "h-p03", type: "publish", ppn: "TPS562201", productTitle: "2A 17V D-CAP2 经济型 Buck",          version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发",                              when: "2 天前",      timestamp: Date.now() - 2*24*3600*1000 },
  { id: "h-p04", type: "publish", ppn: "LM5117",    productTitle: "宽 VIN 75V 电流模式 Buck Controller",version: "v2.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "v2.0 大版本,补全应用电路示例",  when: "3 天前",      timestamp: Date.now() - 3*24*3600*1000 },
  { id: "h-p05", type: "publish", ppn: "BQ24617",   productTitle: "多化学体系单节锂电池充电管理",        version: "v1.3", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "更新支持的电池类型清单",          when: "4 天前",      timestamp: Date.now() - 4*24*3600*1000 },
  { id: "h-p06", type: "publish", ppn: "TPS65217",  productTitle: "PMIC: 3 DC/DC + 4 LDO + 充电器",     version: "v1.2", action: "released", channels: ["website"],                publisher: "张文远", comment: "修正配电时序图",                  when: "5 天前",      timestamp: Date.now() - 5*24*3600*1000 },
  { id: "h-p07", type: "publish", ppn: "TPS7A4501", productTitle: "1A 36V 超低噪声 LDO",               version: "v1.1", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "更新 PSRR 曲线",                  when: "1 周前",       timestamp: Date.now() - 7*24*3600*1000 },
  { id: "h-p08", type: "publish", ppn: "LM2596",    productTitle: "经典 3A Step-Down",                  version: "v0.9", action: "withdrawn", channels: ["website", "distributor"], publisher: "张文远", comment: "EOL 撤回,所有渠道下架",          when: "1 周前",       timestamp: Date.now() - 8*24*3600*1000 },
  { id: "h-p09", type: "publish", ppn: "TPS563200", productTitle: "3A 17V D-CAP2 同步降压",            version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发",                              when: "10 天前",      timestamp: Date.now() - 10*24*3600*1000 },
  { id: "h-p10", type: "publish", ppn: "TPS54424",  productTitle: "4A 28V 同步降压(汽车级)",            version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "AEC-Q100 Grade 1 认证完成,首发", when: "2 周前",       timestamp: Date.now() - 14*24*3600*1000 },
  { id: "h-p11", type: "publish", ppn: "LP38798",   productTitle: "1A 超低噪声可调 LDO",                 version: "v1.0", action: "released", channels: ["website"],                publisher: "张文远", comment: "首发,仅官网",                      when: "2 周前",       timestamp: Date.now() - 15*24*3600*1000 },
  { id: "h-p12", type: "publish", ppn: "BQ25770",   productTitle: "4S 锂电池充电管理(USB-PD)",          version: "v1.1", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "更新 USB-PD 协议支持",            when: "3 周前",       timestamp: Date.now() - 21*24*3600*1000 },
  { id: "h-p13", type: "publish", ppn: "TPS22918",  productTitle: "2A 单通道负载开关",                    version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发",                              when: "3 周前",       timestamp: Date.now() - 23*24*3600*1000 },
  { id: "h-p14", type: "publish", ppn: "UCC27517",  productTitle: "4A 单通道低边栅极驱动",                version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发",                              when: "1 月前",       timestamp: Date.now() - 30*24*3600*1000 },
  { id: "h-p15", type: "publish", ppn: "TPS61299",  productTitle: "5A 同步升压转换器",                    version: "v0.8", action: "released", channels: ["website"],                publisher: "张文远", comment: "Beta 版,只发官网",                  when: "1 月前",       timestamp: Date.now() - 33*24*3600*1000 },
  { id: "h-p16", type: "publish", ppn: "TPS65072",  productTitle: "便携设备 PMIC",                        version: "v1.0", action: "released", channels: ["website", "distributor"], publisher: "张文远", comment: "首发",                              when: "1 月前",       timestamp: Date.now() - 35*24*3600*1000 },
];

// ============================================================
// 收件箱 mock —— 按 user.id 索引,切换角色后看到不同 inbox
// ============================================================
const REVIEW_INBOX = {
  wenyuan: [
    {
      id: "rv-w1", ppn: "MP1582", version: "v0.1", type: "新产品",
      submitter: "陈悦", submittedAt: "5 月 4 日 10:23",
      summary: "MP1582 初稿提交审核 — 3A 20V Buck,新增 PG 引脚",
      chapters: 16, changedChapters: 15,
    },
    {
      id: "rv-w2", ppn: "TPS563200", version: "v1.1", type: "版本升级",
      submitter: "李志强", submittedAt: "5 月 3 日 16:45",
      summary: "TPS563200 升级 v1.0 → v1.1 — IOUT 3A → 3.5A,加 PSR 反馈",
      chapters: 16, changedChapters: 8,
    },
  ],
  chenyue: [
    {
      id: "rv-c1", ppn: "TPS54824", version: "v0.1", type: "新产品",
      submitter: "张文远", submittedAt: "5 月 4 日 09:15",
      summary: "TPS54824 初稿提交审核 — 8A 28V 同步降压(集成 FET)",
      chapters: 16, changedChapters: 16,
    },
    {
      id: "rv-c2", ppn: "TPS62410", version: "v0.5", type: "新产品",
      submitter: "李志强", submittedAt: "5 月 3 日 11:30",
      summary: "TPS62410 初稿提交 — 双路 Buck,效率曲线已补",
      chapters: 18, changedChapters: 18,
    },
    {
      id: "rv-c3", ppn: "TPS62130", version: "v1.2", type: "版本升级",
      submitter: "王晓敏", submittedAt: "5 月 2 日 17:20",
      summary: "TPS62130 v1.1 → v1.2 — 修订效率曲线",
      chapters: 16, changedChapters: 4,
    },
  ],
  lizhiqiang: [
    {
      id: "rv-l1", ppn: "BQ24617", version: "v1.4", type: "版本升级",
      submitter: "吴静", submittedAt: "5 月 4 日 14:50",
      summary: "BQ24617 v1.3 → v1.4 — 加入 USB-C PD 支持",
      chapters: 14, changedChapters: 5,
    },
  ],
};

const PUBLISH_INBOX = {
  wenyuan: [
    {
      id: "pb-w1", ppn: "MP1482", version: "v1.2",
      approvedAt: "5 月 4 日 14:30", approver: "陈悦",
      summary: "MP1482 v1.2 已审批通过,待发布到官网与分销商",
      changeNotes: "更新典型应用图,修订效率曲线",
    },
  ],
  chenyue: [
    {
      id: "pb-c1", ppn: "TPS563200", version: "v1.0",
      approvedAt: "5 月 3 日 18:00", approver: "张文远",
      summary: "TPS563200 v1.0 首发,等待发布到官网与分销商",
      changeNotes: "首发,正式版",
    },
    {
      id: "pb-c2", ppn: "TPS65217", version: "v1.3",
      approvedAt: "5 月 3 日 11:00", approver: "张文远",
      summary: "TPS65217 v1.3 已审批通过,待发布",
      changeNotes: "更新 PMIC 时序图,增加典型应用",
    },
  ],
  lizhiqiang: [],
};

// 渠道名称映射
const CHANNEL_LABEL_MAP = {
  website:     "官网",
  distributor: "分销商",
  app:         "App",
  email:       "邮件订阅",
};


// 分类 id → 中文名(用于筛选 chip 显示)
const CATEGORY_LABEL_MAP = TI_CATEGORIES.reduce((m, c) => { m[c.id] = c.name; return m; }, {});

// 完整分类树(用于 DocList 左侧导航 + 数据)
const CATEGORY_TREE = [
  {
    id: "all", name: "全部产品",
    children: [
      {
        id: "dcdc", name: "DC/DC 开关稳压器",
        children: [
          { id: "buck",      name: "Buck 降压" },
          { id: "boost",     name: "Boost 升压" },
          { id: "buckboost", name: "Buck-Boost 升降压" },
          { id: "module",    name: "DC/DC 电源模块" },
        ],
      },
      { id: "linear", name: "LDO 线性稳压器",
        children: [{ id: "ldo", name: "LDO" }],
      },
      {
        id: "pmic", name: "多路 PMIC",
        children: [
          { id: "pmic_ddr", name: "DDR 内存电源" },
          { id: "pmic_soc", name: "处理器 PMIC" },
        ],
      },
      {
        id: "battery", name: "电池管理",
        children: [
          { id: "charger", name: "充电管理 IC" },
          { id: "gauge",   name: "电量计" },
          { id: "protect", name: "电池保护" },
        ],
      },
      {
        id: "acdc", name: "AC/DC 开关稳压器",
        children: [
          { id: "flyback", name: "反激控制器" },
          { id: "pfc",     name: "PFC 控制器" },
          { id: "llc",     name: "LLC 谐振" },
        ],
      },
      {
        id: "gate", name: "栅极驱动",
        children: [
          { id: "gate_hb",  name: "半桥驱动" },
          { id: "gate_lo",  name: "低边驱动" },
          { id: "gate_iso", name: "隔离驱动" },
        ],
      },
      { id: "switch", name: "负载开关",
        children: [{ id: "lswitch", name: "负载开关" }],
      },
      { id: "supr", name: "电源监控/复位",
        children: [{ id: "supervisor", name: "电源监控/复位" }],
      },
    ],
  },
];

// 工具:把分类 id 找到所有 leaf id(用于"点 dcdc 包含 buck/boost/buckboost/module")
function getLeafCategoryIds(nodeId) {
  function find(nodes) {
    for (const n of nodes) {
      if (n.id === nodeId) return n;
      if (n.children) {
        const r = find(n.children);
        if (r) return r;
      }
    }
    return null;
  }
  const node = find(CATEGORY_TREE);
  if (!node) return [];
  if (!node.children) return [node.id];
  const out = [];
  function collect(n) {
    if (!n.children) { out.push(n.id); return; }
    n.children.forEach(collect);
  }
  collect(node);
  return out;
}


// ============================================================
// 预设问答库 — APP 环境下不依赖 Claude API,直接用关键词匹配返回
//
// 每条记录:
//   keywords: 触发关键词数组(任一命中即匹配)
//   reply: AI 自然语言回答
//   filters: 可选,自动应用到产品库
//   showProducts: 可选,在气泡里展示产品卡片
// ============================================================
const PRESET_QA = [
  // === 产品对比 ===
  {
    keywords: ["tps54824", "lm5117"],
    matchAll: true,
    reply: "TPS54824 vs LM5117 — 两者定位完全不同。\n\n• TPS54824:8A 28V 同步降压,集成 FET。一颗芯片解决问题,适合 5–28V 输入、PCB 紧凑、电流到 8A 的工业 POL。\n\n• LM5117:宽 VIN(75V max)电流模式 Buck Controller,需外置 MOSFET。适合工业级高压输入(48V 系统、电信)、大电流(>10A)、灵活性更高的场景。\n\n选型口诀:输入 28V 以下 + 电流 ≤8A → TPS54824;输入更高或电流更大 → LM5117。",
    showProducts: ["TPS54824", "LM5117"],
  },
  {
    keywords: ["tps62130", "tps563200"],
    matchAll: true,
    reply: "TPS62130 vs TPS563200 — 都是 3A 17V Buck,但定位不同。\n\n• TPS62130:DCS-Control 低噪声架构,响应快、轻载效率高、适合便携/电池设备。\n\n• TPS563200:D-CAP2 控制,设计简单、外围少,适合通用 POL,成本更低。\n\n选 TPS62130 用于音频、模拟前端这类对噪声敏感的场景;选 TPS563200 用于一般数字负载。",
    showProducts: ["TPS62130", "TPS563200"],
  },
  {
    keywords: ["tps7a4501", "ldo", "区别"],
    matchAll: true,
    reply: "TPS7A4501 是超低噪声 LDO(<4 µVRMS),专为模拟敏感电路设计:ADC、DAC、PLL、高速接口等。\n\n相比普通 LDO:\n• 噪声密度更低(典型 LDO 30 µVRMS,TPS7A4501 < 4 µVRMS)\n• PSRR 更高(>80 dB @ 1MHz)\n• 输入电压能到 36V,适合直接挂母线后给敏感电路供电\n\n代价是静态电流稍大、价格高。一般负载就用 TLV70 系列或 LP38 系列就够。",
    showProducts: ["TPS7A4501"],
  },
  {
    keywords: ["lm2596", "tps54824", "选哪个"],
    matchAll: true,
    reply: "LM2596 是经典老款(EOL),不建议新设计选。原因:\n\n• 非同步整流 → 效率只有 75-85%\n• 工作频率 150kHz 较低 → 需要大电感、大电容\n• 已 EOL,长期供货风险\n\nTPS54824 是 LM2596 的现代替代:同步整流、500kHz、效率 90%+、PCB 体积小一半。新设计选 TPS54824。",
    showProducts: ["LM2596", "TPS54824"],
  },

  // === 数据查询 ===
  {
    keywords: ["bq24617", "锂电", "几节"],
    matchAll: false,
    reply: "BQ24617 是单节(1S)锂离子/锂聚合物电池充电管理 IC。\n\n关键特性:\n• 输入 5-20V,可接 USB 或适配器\n• 充电电流可调,最大 10A\n• 支持 Power Path,电池充电同时给系统供电\n• 多化学体系兼容(LiCoO2 / LiFePO4 / LiMn2O4)\n\n如果做 2-4 节,看 BQ24735 或 BQ25700 系列。",
    showProducts: ["BQ24617"],
  },

  // === 技术咨询 ===
  {
    keywords: ["3a", "电感"],
    matchAll: true,
    reply: "3A 输出 Buck 选电感,关键 4 步:\n\n1. **电感量** L = (Vin − Vout) × Vout / (Vin × fsw × ΔIL)。常用 ΔIL 取 30% × Iout = 0.9A,500kHz 下大致需要 4.7–10 µH(具体看 Vin/Vout)。\n\n2. **饱和电流** ≥ 1.3 × Iout_peak,即 ≥ 4A 起步,留 30% 余量。\n\n3. **DCR** 越小效率越高,3A 应用建议 < 30mΩ。\n\n4. **尺寸** 3A 下常用 5×5×3mm 或 6×6×3mm 屏蔽功率电感。\n\n推荐型号:Würth 7447789004(4.7µH/4.05A/16.5mΩ),Coilcraft XAL5050(变体多)。",
  },
  {
    keywords: ["buck", "ldo", "怎么选"],
    matchAll: true,
    reply: "Buck vs LDO 选型口诀:**压差小 → LDO,压差大 → Buck。**\n\n• Vin/Vout 差 ≤ 1V 或电流 ≤ 100mA → LDO(简单、噪声低、便宜)\n• 压差 > 2V 且电流 > 200mA → Buck(效率 90%+ vs LDO 的 30-50%)\n• 噪声敏感(ADC/PLL/RF) → LDO 或 Buck+LDO 串联\n• 电池供电求长续航 → Buck\n\n临界场景例:5V → 3.3V @ 500mA,理论 LDO 损耗 0.85W,Buck 0.15W,选 Buck;但若做模拟电源,可以 Buck 5V→3.6V → LDO 3.6V→3.3V,兼顾效率和噪声。",
  },
  {
    keywords: ["psrr"],
    matchAll: false,
    reply: "PSRR(Power Supply Rejection Ratio,电源抑制比)衡量稳压器**抑制输入纹波**的能力,单位 dB。\n\nPSRR = 20·log(ΔVin / ΔVout)\n\n• 60 dB 表示 1V 输入纹波 → 1mV 输出纹波\n• 越高越好,但**频率特性决定一切** — 低频(100Hz)PSRR 通常 70-80dB,高频(1MHz)可能掉到 30dB\n\nLDO 应用看高频 PSRR(因为前级 Buck 的开关纹波在 100kHz-1MHz 区间)。TPS7A4501 在 1MHz 处仍 >55dB,这就是它适合给 ADC 供电的原因。",
  },
  {
    keywords: ["buck", "效率"],
    matchAll: true,
    reply: "Buck 效率主要受 4 个因素影响:\n\n1. **导通损耗** Pcond = Iout² × (Rds_on + DCR_L) — 选低 Rds_on FET、低 DCR 电感\n2. **开关损耗** Psw ∝ Vin × Iout × fsw — 高频开关效率会降\n3. **门级驱动损耗** Pg ∝ Qg × fsw\n4. **电感铁损** + **死区时间损耗**(同步整流的体二极管导通)\n\n经验:5V 系统效率 85-92%,12V 系统 88-94%,24V 系统 92-96%。轻载效率看 PFM 模式(Skip/Eco-mode)。重载效率瓶颈往往是电感 DCR + FET Rds_on。",
  },
  {
    keywords: ["同步整流"],
    matchAll: false,
    reply: "同步整流(Synchronous Rectification)用 MOSFET 替代续流二极管,显著提升效率。\n\n传统 Buck 的下管是肖特基二极管,导通压降 0.4-0.5V。在 5A 续流时损耗 = 0.5V × 5A × 50%(占空比) = 1.25W,效率拉低 5-10%。\n\n同步整流用 MOSFET 替代,Rds_on 典型 10mΩ,损耗 = 5² × 0.01 × 50% = 0.125W,**降低一个数量级**。\n\n代价是控制复杂度上升(需要死区时间控制避免直通短路),但现代集成 Buck 都标配。所以 TPS54824 / TPS562201 这类全部是同步整流。",
  },

  // === 场景推荐 ===
  {
    keywords: ["12v", "3.3v", "5a"],
    matchAll: true,
    reply: "12V → 3.3V @ 5A,首推 **TPS54824**。\n\n为什么:\n• 输入范围 4.5-28V,12V 完美覆盖\n• 输出电流到 8A,5A 留 60% 余量\n• 集成 FET,无需选 MOSFET,BOM 简单\n• 同步整流,12V→3.3V 效率 ~93%\n• D-CAP3 控制,补偿网络免设计\n\n外围只需:输入电容(2× 22µF)+ 输出电容(2× 47µF)+ 电感(4.7µH/8A)+ 反馈分压。",
    showProducts: ["TPS54824"],
  },
  {
    keywords: ["usb-pd", "充电"],
    matchAll: true,
    reply: "USB-PD 充电分两块:\n\n• **PD 协商控制器**:TPS25750(集成 USB-C PHY + PD3.1 + 100W),做 Source/Sink/Dual-Role 都行\n\n• **充电管理 IC**:看电池节数 — 1S 选 BQ25896(SMBus 控制),2-4S 选 BQ25713/BQ25770\n\n如果做 65W 笔电充电器,典型方案:USB-C 接口 → TPS25750 协商 → BQ25770(4S)管理电池。",
    showProducts: ["BQ24617"],
  },
  {
    keywords: ["汽车", "buck"],
    matchAll: true,
    reply: "汽车级 Buck 看 3 个关键:\n\n1. **AEC-Q100 认证**(Grade 1 −40~125°C,Grade 0 到 150°C)\n2. **宽 VIN** — 12V 系统冷启动到 6V、抛负载到 36V,需要 4.5–40V 起步\n3. **EMC** — CISPR 25 Class 5\n\nTI 推荐:\n• LMR16030-Q1(60V/3A 集成 FET)\n• LM53635-Q1(36V/3.5A,低 EMI 扩频)\n• TPS54424-Q1(28V/4A)\n\n大电流走外置 FET 控制器:LM5146-Q1(100V)、LM25116-Q1(42V)。",
    showProducts: ["LM5117"],
  },
  {
    keywords: ["宽vin", "工业"],
    matchAll: false,
    reply: "工业宽 VIN(典型 24V/48V 系统)推荐 **LM5117**。\n\n• 输入 4.5-75V,完全覆盖工业母线波动\n• 电流模式控制 + 外置 FET → 灵活配置 5-15A 输出\n• 集成软启动、电流限制、PG 输出\n• 工作频率可调 50kHz–750kHz\n\n如果想要集成 FET 省事,看 LMR36015(60V/1.5A),但电流较小。\n\n大电流(>15A)考虑 LM25116 或 SLC1188 多相方案。",
    showProducts: ["LM5117"],
  },
];

// 模糊匹配:在文本中检查关键词命中
function matchPresetQA(userText) {
  const t = userText.toLowerCase();
  for (const qa of PRESET_QA) {
    const matched = qa.matchAll
      ? qa.keywords.every(k => t.includes(k.toLowerCase()))
      : qa.keywords.some(k => t.includes(k.toLowerCase()));
    if (matched) return qa;
  }
  return null;
}


// ============================================================
// AI API 集成 — 使用 Claude Artifacts 内置的 window.claude.complete
// ============================================================

// 系统 prompt — 给 AI 明确身份和能力
// AI 系统提示词(参数化用户名 — 切换角色后 AI 用对应用户称呼)
function getSystemPrompt(userName = "用户") {
  return `你是华东芯片 Datapilot 平台的 AI 助手,帮助 PM ${userName} 管理 TI 电源管理 IC 的产品手册库。

# 你的核心能力
1. **产品筛选** — 用户说"找 Buck 类、量产的产品"等
2. **产品对比** — 例如 TPS54824 vs LM5117
3. **技术咨询** — 电源 IC 设计相关(电感选型、Buck/LDO 选择、PSRR、效率分析等)
4. **场景推荐** — 根据应用场景推荐 IC

# 真实存在的 9 个 TI 产品(只引用这些,不要编造)
- TPS54824 (Buck) - 8A 28V 同步降压(集成 FET),工业应用
- TPS563200 (Buck) - 3A 17V D-CAP2 控制
- TPS62130 (Buck) - 3A 17V DCS-Control,低噪声
- TPS562201 (Buck) - 2A 17V D-CAP2,经济型
- TPS7A4501 (LDO) - 1A 36V 超低噪声 LDO,模拟电源
- LM5117 (Buck Controller) - 宽 VIN 75V 电流模式,需外置 FET
- LM2596 (Buck) - 经典 3A Step-Down(EOL)
- BQ24617 (Charger) - 多化学体系单节锂电充电
- TPS65217 (PMIC) - 多路集成 PMIC

# 撰写人列表
张文远、陈悦、李志强、王晓敏、刘建华、吴静、周伟、孙琳、赵明轩、马晨曦

# 回答风格
- 专业、简洁、有条理
- 中文回复
- 涉及具体产品时,用 markdown 列表
- 技术问题给具体数字和公式
- 不要长篇大论(3-8 句为宜)`;
}

// 检查 AI API 是否可用
function isAIAvailable() {
  // Vercel 部署版本:始终可用(走 /api/chat 代理)
  return true;
}

// 调用 AI API(通过 /api/chat Vercel 代理 → DeepSeek)
async function callAINative(messages, userName) {
  const lastUser = messages.filter(m => m.role === "user").slice(-1)[0];
  const userMessage = lastUser?.content || "";

  // 历史对话(取最近 10 条)
  const history = messages
    .filter(m => m.role === "user" || m.role === "assistant" || m.role === "ai")
    .slice(-10)
    .map(m => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: typeof m.content === "string" ? m.content : (m.rawText || "[结构化消息]"),
    }));

  const apiMessages = [
    { role: "system", content: getSystemPrompt(userName) },
    ...history,
  ];

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: apiMessages, stream: false }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("AI 返回空响应");
  return text.trim();
}

// 伪流式:拿到完整结果后,按字符渐进 callback
async function callAIStream(messages, onChunk, userName) {
  const fullText = await callAINative(messages, userName);
  const chunkSize = 6;
  for (let i = chunkSize; i <= fullText.length; i += chunkSize) {
    onChunk(fullText.slice(0, i));
    await new Promise(r => setTimeout(r, 30));
  }
  if (fullText.length % chunkSize !== 0) {
    onChunk(fullText);
  }
  return fullText;
}


// 自动从用户首句生成对话标题(最多 24 字)
function makeChatTitle(firstUserMessage) {
  const text = (firstUserMessage || "新对话").trim();
  if (text.length <= 24) return text;
  return text.slice(0, 22) + "…";
}

// 时间戳转分组("today" | "yesterday" | "week" | "earlier")
function getTimeGroup(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "today";
  if (diff < 2 * day) return "yesterday";
  if (diff < 7 * day) return "week";
  return "earlier";
}

const SAMPLE_CHAT_HISTORY = [
  // 这是初始假数据(Demo 演示用),实际新对话会在运行时通过 setChatHistory 添加
  { id: "c1", title: "MP1482 → MP1582 改版 (2A→3A)",  group: "today",   pinned: true,  taskState: "await", messages: [] },
  { id: "c2", title: "新 LDO 立项咨询",                 group: "today",   pinned: false, messages: [] },
  { id: "c3", title: "Q2 待审手册一览",                 group: "today",   pinned: false, messages: [] },
  { id: "c4", title: "MP6908A v1.1 配置检查",           group: "week",    pinned: false, taskState: "running", messages: [] },
  { id: "c5", title: "TPS54824 v2.0 重写描述",          group: "week",    pinned: false, messages: [] },
  { id: "c6", title: "BU 全季产品规划",                 group: "earlier", pinned: false, messages: [] },
  { id: "c7", title: "客户高频问题归集",                group: "earlier", pinned: false, messages: [] },
];

// 根据意图生成模拟对话内容
function buildMessagesForIntent(intentId, payload) {
  switch (intentId) {
    case "write-new":
      return {
        intentType: "change-plan",
        intentPayload: {
          product: "MP1582",
          projectType: "new",
          targetState: "draft",
          reference: { id: "prd-1", type: "PRD", title: "MP1582 立项 PRD v0.3" },
        },
        messages: [
          { role: "ai", content: <>好,我们一起做一颗新芯片。我先问你 3 个问题搞清楚情况:</> },
          { role: "ai", content: <><strong>第 1 步:工程类型?</strong><br/><span className="text-[12px] text-[var(--ink-2)]">绝大多数手册其实都有参考对象,纯白手册很少。</span></> },
          { role: "user", content: "新产品第一版,有 PRD 文档" },
          { kind: "task", state: "done", title: "已确认工程类型 · 新产品第一版",   detail: "参考对象类型: PRD 立项文档" },
          { role: "ai", content: <><strong>第 2 步:参考材料?</strong><br/><span className="text-[12px] text-[var(--ink-2)]">告诉我新产品的主要功能,我从 PRD 库 / 旧 datasheet / 竞品库帮你找。</span></> },
          { role: "user", content: "Buck 转换器,3A,VIN 4.5-20V,带 Power Good 引脚,目标 600kHz 以上" },
          { kind: "task", state: "running", title: "AI 正在检索参考材料...",       detail: "扫描 PRD 库、旧 datasheet 库、竞品库" },
          { kind: "task", state: "done",    title: "找到 7 份高相关度参考材料",     detail: "PRD 2 份 · 旧 datasheet 3 份(MP1482/MP1484/MP2451)· 竞品参考 2 份(TI)" },
          { role: "ai", content: <>主区已展示参考材料。最相关的是 <strong>「MP1582 立项 PRD v0.3」</strong>(96% 匹配),其次是 <strong>「MP1482 v1.2」</strong>(96% 匹配,作为升级基础)。<br/><br/><strong>第 3 步:目标版本?</strong><br/>5 种状态:<span className="font-mono text-[12px]">draft / alpha / beta / GA / custom</span>。第一稿建议从 <strong>draft 初始版</strong> 开始。</> },
          { role: "user", content: "就 draft 初始版" },
          { kind: "task", state: "done", title: "已建立写作工程",                  detail: "MP1582 · v0.1-draft · 参考 MP1482 v1.2" },
          { role: "ai", content: <>好。我已分析 PRD + MP1482 datasheet + 16 章模板,<strong>右侧主区是改动清单</strong> — 我列出了每章需要做什么、难度多大、AI 能不能帮你。<br/><br/>继续点 <strong>「开始编辑」</strong> 进入写作。</> },
        ],
      };

    case "edit-old-with-plan":
    case "edit-old":
      return {
        intentType: "change-plan",
        intentPayload: {
          product: "MP1582",
          projectType: "upgrade",
          targetState: "draft",
          reference: { id: "ds-1", type: "datasheet", title: "MP1482 v1.2" },
        },
        messages: [
          { role: "ai", content: <>好,老版本升级。<br/><br/><strong>改哪个产品?改成什么样?</strong></> },
          { role: "user", content: "在 MP1482 v1.2 基础上做 MP1582,IOUT 2A 升 3A,VIN 上限 18V → 20V,频率 340kHz → 600kHz,加 Power Good 引脚" },
          { kind: "task", state: "running", title: "正在加载 MP1482 v1.2 全文",     detail: "13 页 · 47 字段 · 28 条术语 · 16 章节" },
          { kind: "task", state: "done",    title: "已加载,作为参考材料",            detail: "AI 将基于此版本生成改动清单" },
          { kind: "task", state: "running", title: "AI 正在分析新需求 vs 旧版本",     detail: "对比 16 章节,识别需要改动的部分" },
          { kind: "task", state: "done",    title: "改动清单已生成",                  detail: "15 节需要改 · 1 节保留(免责声明)· 最难的是第 9 节(电气参数全表)和第 11 节(新增 PG 功能描述)" },
          { role: "ai", content: <>右侧主区是 <strong>改动清单</strong>。我标注了每章的改动内容、难度、AI 协作方式。<br/>注意第 11 节"功能介绍" — 你需要新增 PG 章节,这一节最关键,我建议你协作完成。<br/><br/>确认无误就点 <strong>「开始编辑」</strong> 进入写作。</> },
        ],
      };


    case "find-doc":
      return {
        intentType: "doc-list",
        intentPayload: { filter: payload?.filter || "all" },
        messages: [
          { role: "ai", content: <>好,我帮你查文档。<br/>主区已经列出了 <strong>5 条匹配结果</strong>。继续告诉我筛选条件,比如「只看草稿」「只看我审过的」「按更新时间倒序」。</> },
        ],
      };

    case "run-check":
      return {
        intentType: "report",
        intentPayload: { product: "TPS563231" },
        messages: [
          { role: "ai", content: <>对 <span className="font-mono">TPS563231 v1.0-rc1</span> 跑了配置检查。</> },
          { kind: "task", state: "done", title: "扫描完成",            detail: "TI 写作风格 + 企业术语 + 行业合规 3 套规则" },
          { kind: "task", state: "done", title: "发现 5 处问题",        detail: "1 个错误 · 2 个警告 · 2 个提示" },
          { role: "ai", content: <>详细报告在主区。<br/>需要我「全部修」、「只修错误」、「展示对比 diff」吗?</> },
        ],
      };

    case "review-status":
      return {
        intentType: "doc-list",
        intentPayload: { filter: "review" },
        messages: [
          { role: "ai", content: <>查到了你跟审批相关的手册:</> },
          { kind: "task", state: "done", title: "我提交在审 · 1 份",    detail: "TPS563200 v1.1,卡在李志强,3 天" },
          { kind: "task", state: "done", title: "等我审批 · 2 份",      detail: "见左侧栏 「审核流转」 红点提示" },
          { role: "ai", content: <>主区列出了详情。要不要我帮你「催一下李志强」或者「先看等我审的那两份」?</> },
        ],
      };

    case "from-doc":
      return {
        intentType: "doc-edit",
        intentPayload: { product: "TPS5xxxxx", version: "v0.1-draft" },
        messages: [
          { role: "ai", content: <>好,基于已有文档创作。<br/><br/><strong>把参考材料拖到对话框,或告诉我位置。</strong> 支持 PRD / 旧 datasheet / 竞品手册 / 测试报告。</> },
          { role: "user", content: "PRD_TPS5xxxx_v0.3.pdf(已上传)" },
          { kind: "task", state: "done", title: "已读完 PRD(14 页)",     detail: "自动识别品类、关键参数、应用场景" },
          { kind: "task", state: "done", title: "已起草 datasheet 框架", detail: "12/47 字段从 PRD 直接提取" },
          { role: "ai", content: <>已经把识别到的字段填进 schema 了,主区是初稿。<br/>有没有 PRD 里没说但你心里有的目标参数(比如目标效率、量产时间)?</> },
        ],
      };

    case "freeform":
      return {
        intentType: "doc-list",
        intentPayload: { filter: "all" },
        messages: [
          { role: "user", content: payload?.text || "" },
          { kind: "thinking" },  // 由 handleIntent 触发后续 AI 调用
        ],
      };

    default:
      return {
        intentType: "doc-edit",
        intentPayload: { product: "MP1582", version: "v0.1-draft" },
        messages: [
          { role: "ai", content: "好,我们一起开始。" },
        ],
      };
  }
}

// ============================================================
// 14. 主 App
// ============================================================
export default function DatapilotV6() {
  const [appState, setAppState] = useState("idle"); // idle | working
  const [collapsed, setCollapsed] = useLocalStorage("datapilot:collapsed", false);
  const [currentUserId, setCurrentUserId] = useLocalStorage("datapilot:currentUserId", DEFAULT_USER_ID);
  const currentUser = getUserById(currentUserId);
  const [chatInput, setChatInput] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentSection, setCurrentSection] = useState("home");
  const [currentSubSection, setCurrentSubSection] = useState(null);

  // AI 对话区 / 写作区分割比例(0-1,表示对话区占可用宽度的比例)
  const [chatRatio, setChatRatio] = useState(0.5);  // 默认 50/50

  // 工作态的对话内容
  const [intentType, setIntentType] = useState(null);
  const [intentPayload, setIntentPayload] = useState(null);
  const [messages, setMessages] = useState([]);

  // 对话历史(可变,新对话会动态加入)
  const [chatHistory, setChatHistory] = useState(SAMPLE_CHAT_HISTORY);
  // 标记当前对话是否已经被持久化(用于决定第一条消息是新建 history 还是更新 history)
  const [currentChatPersisted, setCurrentChatPersisted] = useState(false);

  // 全局快捷键
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "[" && !e.target.matches("input,textarea")) {
        e.preventDefault();
        setCollapsed(c => !c);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 渲染 AI 回复气泡(reply 文本 + 可选产品卡片) — 提前定义,handleIntent / handleWorkingSubmit 都用
  const renderAIBubble = (replyText, showProducts) => {
    const cardProducts = (showProducts || [])
      .map(ppn => ALL_PRODUCTS.find(p => p.ppn === ppn))
      .filter(Boolean)
      .slice(0, 3);
    const publishLabelMap = { unpublished: "待发布", published: "已发布", withdrawn: "已撤回" };
    return (
      <div>
        <div className="leading-[1.65] whitespace-pre-wrap">{replyText}</div>
        {cardProducts.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {cardProducts.map(p => (
              <ProductCard
                key={p.ppn}
                ppn={p.ppn}
                title={p.title}
                status={`${p.lifecycle} · ${publishLabelMap[p.publishState] || p.publishState}${p.publishedVer ? ` ${p.publishedVer}` : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleIntent = async (intentId, payload) => {
    const built = buildMessagesForIntent(intentId, payload);
    setIntentType(built.intentType);
    setIntentPayload(built.intentPayload);
    setMessages(built.messages);
    setCurrentChatId(`new-${Date.now()}`);
    setCurrentSection("");
    setCurrentSubSection(null);
    setAppState("working");

    // freeform — 用户在 Idle 屏自由输入,转为 Working
    // freeform — 用户在 Idle 屏自由输入,转为 Working,触发 AI
    if (intentId === "freeform" && payload?.text) {
      const userText = payload.text;
      const userMsg = { role: "user", content: userText };
      const newChatId = `chat-${Date.now()}`;
      setCurrentChatId(newChatId);

      // 立即显示用户消息 + 思考态
      setMessages([userMsg, { kind: "thinking" }]);

      // 优先级 1:预设问答库
      const preset = matchPresetQA(userText);
      if (preset) {
        await new Promise(r => setTimeout(r, 400));
        if (preset.filters) {
          setIntentPayload(prev => ({ ...prev, aiFilters: preset.filters }));
        }
        const aiMsg = {
          role: "ai",
          content: renderAIBubble(preset.reply, preset.showProducts),
          rawText: preset.reply,
        };
        const finalMessages = [userMsg, aiMsg];
        setMessages(finalMessages);
        persistCurrentChat(newChatId, finalMessages);
        setCurrentChatPersisted(true);
        return;
      }

      // 优先级 2:DeepSeek API(流式)
      let apiSucceeded = false;
      try {
        const apiMessages = [{ role: "user", content: userText }];
        let lastFullText = "";
        await callAIStream(apiMessages, (fullText) => {
          lastFullText = fullText;
          setMessages([
            userMsg,
            { role: "ai", content: renderAIBubble(fullText, []), rawText: fullText, streaming: true },
          ]);
        }, currentUser.name);
        if (lastFullText) {
          const finalAiMsg = { role: "ai", content: renderAIBubble(lastFullText, []), rawText: lastFullText };
          const finalMessages = [userMsg, finalAiMsg];
          setMessages(finalMessages);
          persistCurrentChat(newChatId, finalMessages);
          setCurrentChatPersisted(true);
          apiSucceeded = true;
        }
      } catch (err) {
        console.warn("DeepSeek API 调用失败,降级", err);
      }

      if (apiSucceeded) return;

      // 优先级 3:关键词解析
      const filters = parseFilterKeywords(userText);
      if (filters) {
        setIntentPayload(prev => ({ ...prev, aiFilters: filters }));
        const aiMsg = {
          role: "ai",
          content: renderAIBubble("已为你应用筛选,主区已更新。", []),
          rawText: "已为你应用筛选,主区已更新。",
        };
        const finalMessages = [userMsg, aiMsg];
        setMessages(finalMessages);
        persistCurrentChat(newChatId, finalMessages);
        setCurrentChatPersisted(true);
        return;
      }

      // 优先级 4:引导
      const guideMsg = {
        role: "ai",
        content: (
          <div>
            <div>AI 服务暂时不可用,试试这些问法:</div>
            <div className="mt-2 space-y-1 text-[12px] text-[var(--ink-2)]">
              <div>· 找所有 Buck 类、量产的产品</div>
              <div>· TPS54824 跟 LM5117 哪个更适合工业?</div>
              <div>· 3A 输出 Buck 选什么电感?</div>
              <div>· BQ24617 能做几节锂电?</div>
            </div>
          </div>
        ),
        rawText: "示例问法",
      };
      const finalMessages = [userMsg, guideMsg];
      setMessages(finalMessages);
      persistCurrentChat(newChatId, finalMessages);
      setCurrentChatPersisted(true);
    }
  };

  const handleNewChat = () => {
    setAppState("idle");
    setMessages([]);
    setIntentType(null);
    setIntentPayload(null);
    setCurrentChatId(null);
    setCurrentSection("home");
    setCurrentSubSection(null);
    setChatInput("");
    setCurrentChatPersisted(false);  // 重置:下次发问会创建新历史项
  };

  // 把当前 messages 同步到 chatHistory(创建或更新)
  const persistCurrentChat = (chatId, allMessages) => {
    // 找出第一条 user 消息作为标题来源
    const firstUserMsg = allMessages.find(m => m.role === "user");
    const titleText = firstUserMsg?.content || "新对话";
    const title = makeChatTitle(typeof titleText === "string" ? titleText : "新对话");

    setChatHistory(prev => {
      const existing = prev.find(c => c.id === chatId);
      if (existing) {
        // 已存在 → 更新 messages
        return prev.map(c => c.id === chatId ? { ...c, messages: allMessages } : c);
      } else {
        // 新建一项,放在最前
        const newEntry = {
          id: chatId,
          title,
          group: "today",
          pinned: false,
          createdAt: Date.now(),
          messages: allMessages,
        };
        return [newEntry, ...prev];
      }
    });
  };

  // 支持 section + subSection
  // section 是 "home" / "writing" / "products" / "review" / "publish"
  // subSection 是 "writing-doing" / "review-pending" 等
  const handleSelectSection = (id) => {
    // 判断是否是子菜单(包含 -)
    const isSub = id.includes("-");
    if (isSub) {
      const parent = id.split("-")[0];
      setCurrentSection(parent);
      setCurrentSubSection(id);
    } else {
      setCurrentSection(id);
      setCurrentSubSection(null);
    }

    if (id === "home") {
      handleNewChat();
      return;
    }

    // 按 id 路由到主区
    let intentType, intentPayload, aiMessage;
    if (id === "products") {
      intentType = "doc-list"; intentPayload = { filter: "all" }; aiMessage = "已为你打开产品中心";
    } else if (id === "writing" || id.startsWith("writing-")) {
      if (id === "writing-doing") {
        intentType = "writing-doing"; intentPayload = {}; aiMessage = "写作中 - 你的草稿和正在审核中的手册";
      } else if (id === "writing-platform") {
        intentType = "platform"; intentPayload = {}; aiMessage = "平台库 - 字段、术语、素材库";
      } else if (id === "writing-templates") {
        intentType = "templates"; intentPayload = {}; aiMessage = "模板库 - 企业模板 + Lumy 共享";
      } else {
        // writing 父级 — 默认走"写作中"
        intentType = "writing-doing"; intentPayload = {}; aiMessage = "写作中心";
      }
    } else if (id === "review" || id === "review-pending") {
      intentType = "review-inbox"; intentPayload = {}; aiMessage = "待我审核 - 这里只显示当前需要你审核的手册";
    } else if (id === "review-history") {
      intentType = "review-history"; intentPayload = {}; aiMessage = "审核历史 - 你过往审核的所有记录";
    } else if (id === "publish" || id === "publish-pending") {
      intentType = "publish-inbox"; intentPayload = {}; aiMessage = "待我发布 - 这里只显示已审批通过、需要你发布的手册";
    } else if (id === "publish-history") {
      intentType = "publish-history"; intentPayload = {}; aiMessage = "发布历史 - 你过往发布的所有记录";
    } else {
      return;
    }

    setIntentType(intentType);
    setIntentPayload(intentPayload);
    setMessages([
      { role: "ai", content: <>已为你打开 <strong>{aiMessage}</strong>。需要我帮忙的话直接说。</> },
    ]);
    setCurrentChatId(null);
    setAppState("working");
  };

  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    setCurrentChatId(chatId);
    setCurrentSection("");
    setCurrentSubSection(null);

    if (chat && chat.messages && chat.messages.length > 0) {
      // 真实对话:恢复 messages,默认进入 doc-list
      setMessages(chat.messages);
      setIntentType("doc-list");
      setIntentPayload({ filter: "all" });
      setCurrentChatPersisted(true);  // 这条对话已经持久化,不再创建新项
    } else {
      // 假数据(SAMPLE_CHAT_HISTORY 里的 demo 项)— 走原来的 ChangePlan 路径
      const built = buildMessagesForIntent("edit-old");
      setIntentType(built.intentType);
      setIntentPayload(built.intentPayload);
      setMessages(built.messages);
      setCurrentChatPersisted(true);
    }
    setAppState("working");
  };

  // 关键词解析(兜底,Claude API 失败时用)
  const parseFilterKeywords = (text) => {
    const filters = {};
    const t = text.toLowerCase();

    // 产品家族 — 跟 TI 分类对应
    const familyMap = {
      "buck": "buck", "降压": "buck",
      "ldo": "ldo", "线性": "ldo",
      "boost": "boost", "升压": "boost",
      "buck-boost": "buckboost", "升降压": "buckboost",
      "module": "module", "模块": "module",
      "充电": "charger", "charger": "charger",
      "电量计": "gauge", "fuel gauge": "gauge",
      "电池保护": "protect",
      "反激": "flyback", "flyback": "flyback",
      "pfc": "pfc",
      "llc": "llc",
      "半桥驱动": "gate_hb",
      "低边驱动": "gate_lo",
      "隔离驱动": "gate_iso",
      "负载开关": "lswitch",
      "电源监控": "supervisor", "复位": "supervisor",
      "ddr": "pmic_ddr",
      "pmic": "pmic_soc",
    };
    for (const [k, v] of Object.entries(familyMap)) {
      if (t.includes(k)) {
        if (!filters.category) filters.category = [];
        if (!filters.category.includes(v)) filters.category.push(v);
      }
    }

    // 生命周期
    const lifecycles = [];
    if (t.includes("在研"))   lifecycles.push("在研");
    if (t.includes("量产"))   lifecycles.push("量产");
    if (t.includes("改版"))   lifecycles.push("改版中");
    if (t.includes("eol") || t.includes("退市")) lifecycles.push("EOL");
    if (lifecycles.length > 0) filters.lifecycle = lifecycles;

    // 审核状态
    const reviews = [];
    if (t.includes("草稿"))         reviews.push("draft");
    if (t.includes("审核中"))       reviews.push("review");
    if (t.includes("已通过") || t.includes("通过审核")) reviews.push("approved");
    if (t.includes("被拒") || t.includes("驳回"))      reviews.push("rejected");
    if (reviews.length > 0) filters.reviewState = reviews;

    // 发布状态
    const publishes = [];
    if (t.includes("待发布"))       publishes.push("unpublished");
    if (t.includes("已发布"))       publishes.push("published");
    if (t.includes("已撤回") || t.includes("撤回")) publishes.push("withdrawn");
    if (publishes.length > 0) filters.publishState = publishes;

    // PPN 前缀
    const ppnMatch = text.match(/(TPS|LM|LP|BQ|UCC|TLV|LMR|LMG|LMZ|TPSM|AMC)[A-Z0-9]+/i);
    if (ppnMatch) filters.ppn = ppnMatch[0].toUpperCase();

    // 撰写人
    for (const owner of PRODUCT_OWNERS) {
      if (text.includes(owner)) { filters.owner = owner; break; }
    }

    return Object.keys(filters).length > 0 ? filters : null;
  };

  // 调用 Claude API(主路径) — 让 AI 真的回答任何问题
  const callClaudeAPI = async (userText, conversationHistory, currentPage = "doc-list") => {
    // 转换历史为 messages 数组(Claude 沙箱推荐格式)
    const messagesArr = conversationHistory
      .filter(m => m.role && (m.role === "user" || m.role === "ai"))
      .slice(-10)  // 只保留最近 10 条
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: typeof m.content === "string" ? m.content : "[结构化消息]",
      }));
    // 加当前用户消息
    messagesArr.push({ role: "user", content: userText });

    // 当前页上下文
    const pageContext = {
      "doc-list":      "用户在产品库(1000 个 TI 产品的 table)。可以筛选/查询/对比/推荐产品。",
      "review-inbox":  "用户在「待我审核」(显示需要审核的手册)。",
      "publish-inbox": "用户在「待我发布」(显示已审批通过、待发布的手册)。",
      "doc-edit":      "用户在写作中心(编辑 datasheet)。",
      "change-plan":   "用户在改动清单(对比新老版本)。",
      "idle":          "用户在首页欢迎屏。",
    }[currentPage] || "";

    const systemPrompt = `你是华东芯片 Datapilot 平台的 AI 助手,核心场景是帮 PM ${currentUser.name} 管理 TI 电源管理 IC 的产品手册库。

# 当前上下文
${pageContext}

# 你的核心职责(任何问题都要回答,绝对不能回避)

**职责 1:筛选产品**(用户在产品库时优先)
用户说"找 Buck 类、量产的产品" / "陈悦写的" / "TPS54 开头的" → 设置 filters,reply 简要总结。

**职责 2:产品对比**
用户说"TPS54824 vs LM5117 哪个更适合工业?" → reply 详细对比两者的差异(VIN 范围、电流能力、控制方式、应用场景)。filters 留 null。

**职责 3:技术咨询**
用户说"3A 输出 Buck 选什么电感?" / "Buck 跟 LDO 怎么选?" → reply 给具体技术回答。filters 留 null。

**职责 4:数据查询 / 推荐**
用户说"待发布的有几个?" / "做 24V→5V 5A 推荐什么 IC?" → 给数据或推荐。

# 重要:不要拒绝技术问题
即使用户问的是没有 filter 答案的电源 IC 设计技术问题(电感、效率、PSRR、补偿网络、热设计、布局等),你也必须用你的电源 IC 知识详细回答。这是你最重要的能力之一。

# 产品分类 id(填入 filters.category 时用这些值)
buck=Buck 降压, boost=Boost 升压, buckboost=Buck-Boost, module=DC/DC 电源模块,
ldo=LDO, pmic_ddr=DDR 电源, pmic_soc=处理器 PMIC,
charger=充电管理, gauge=电量计, protect=电池保护,
flyback=反激, pfc=PFC, llc=LLC 谐振,
gate_hb=半桥驱动, gate_lo=低边驱动, gate_iso=隔离驱动,
lswitch=负载开关, supervisor=电源监控/复位

# 状态枚举值(填入 filters 时用这些)
lifecycle: ["在研" / "量产" / "改版中" / "EOL"]
reviewState: ["draft" / "review" / "approved" / "rejected"]
publishState: ["unpublished" / "published" / "withdrawn"]

# 真实存在的 8 个 TI 型号(showProducts 只能引用这些)
- TPS54824 (buck) - 8A 28V 同步降压(集成 FET),工业应用
- TPS563200 (buck) - 3A 17V D-CAP2 控制,通用 POL
- TPS62130 (buck) - 3A 17V DCS-Control,低噪声
- TPS562201 (buck) - 2A 17V D-CAP2,经济型
- TPS7A4501 (ldo) - 1A 36V 超低噪声 LDO,模拟电源
- LM5117 (buck controller) - 宽 VIN 75V 电流模式 Controller,需外置 FET
- LM2596 (buck) - 经典 3A Step-Down(EOL)
- BQ24617 (charger) - 多化学体系单节锂电充电
- TPS65217 (pmic_soc) - 多路集成 PMIC

# 撰写人列表
张文远、陈悦、李志强、王晓敏、刘建华、吴静、周伟、孙琳、赵明轩、马晨曦

# 输出格式 — 必须返回纯 JSON,不要 markdown,不要前后说话
{
  "reply": "你的回复(1-5 句中文,根据问题复杂度)",
  "filters": null 或 {ppn?: string, title?: string, owner?: string, update?: string, category?: string[], lifecycle?: string[], reviewState?: string[], publishState?: string[]},
  "showProducts": [] 或 ["TPS54824", ...]  // 只能放上面 9 个真实型号
}`;

    const fullPrompt = `${systemPrompt}

# 对话历史(JSON 数组,你要回应最后一条用户消息)

${JSON.stringify(messagesArr, null, 2)}

只返回纯 JSON 对象,不要任何包装、前缀、解释。`;

    if (typeof console !== "undefined" && console.log) {
      console.log("[Datapilot AI] →", userText, "(page:", currentPage + ")");
    }

    const response = await window.claude.complete(fullPrompt);

    if (typeof console !== "undefined" && console.log) {
      console.log("[Datapilot AI] ←", response);
    }

    // 鲁棒 JSON 解析
    let cleaned = (response || "").trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // JSON 解析失败但有响应文本 → 当成 reply 直接显示
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[Datapilot AI] JSON 解析失败,降级为纯文本回复", e);
      }
      // 把 raw response 当做 reply
      return {
        reply: (response || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim(),
        filters: null,
        showProducts: [],
      };
    }
  };

  const handleWorkingSubmit = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput("");

    // 用户消息加入对话流
    const userMsg = { role: "user", content: userText };
    const messagesAfterUser = [...messages, userMsg];
    setMessages([...messagesAfterUser, { kind: "thinking" }]);

    // 确定当前对话 id(没有就生成一个)
    let chatId = currentChatId;
    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      setCurrentChatId(chatId);
    }

    const currentPage = intentType || "doc-list";

    // === 优先级 1:预设问答库(秒答) ===
    const preset = matchPresetQA(userText);
    if (preset) {
      await new Promise(r => setTimeout(r, 400));  // 模拟思考
      // 应用 filters
      if (preset.filters && currentPage === "doc-list") {
        setIntentPayload(prev => ({ ...prev, aiFilters: preset.filters }));
      }
      const aiMsg = {
        role: "ai",
        content: renderAIBubble(preset.reply, preset.showProducts),
        // 同时存原始文本,用于持久化和后续 API 上下文
        rawText: preset.reply,
      };
      const finalMessages = [...messagesAfterUser, aiMsg];
      setMessages(finalMessages);
      persistCurrentChat(chatId, finalMessages);
      setCurrentChatPersisted(true);
      return;
    }

    // === 优先级 2:Claude API(流式响应) ===
    let apiSucceeded = false;
    let apiError = null;  // 记录失败原因用于诊断
    try {
      if (!isAIAvailable()) {
        apiError = "window.claude.complete 不可用";
        throw new Error(apiError);
      }
      // 构造 API messages
      const apiMessages = messagesAfterUser
        .filter(m => m.role === "user" || m.role === "ai")
        .map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.rawText || (typeof m.content === "string" ? m.content : "[结构化消息]"),
        }));

      // 流式调用 — 实时更新气泡内容
      let lastFullText = "";
      await callAIStream(apiMessages, (fullText) => {
        lastFullText = fullText;
        setMessages([
          ...messagesAfterUser,
          { role: "ai", content: renderAIBubble(fullText, []), rawText: fullText, streaming: true },
        ]);
      }, currentUser.name);

      if (lastFullText) {
        const finalAiMsg = {
          role: "ai",
          content: renderAIBubble(lastFullText, []),
          rawText: lastFullText,
        };
        const finalMessages = [...messagesAfterUser, finalAiMsg];
        setMessages(finalMessages);
        persistCurrentChat(chatId, finalMessages);
        setCurrentChatPersisted(true);
        apiSucceeded = true;
      } else {
        apiError = "AI 返回空响应";
      }
    } catch (err) {
      apiError = err?.message || String(err);
      // 不中断 — 继续走兜底
    }

    if (apiSucceeded) return;

    // === 优先级 3:关键词解析(产品筛选) ===
    const filters = parseFilterKeywords(userText);
    if (filters && currentPage === "doc-list") {
      setIntentPayload(prev => ({ ...prev, aiFilters: filters }));
      const replyText = apiError
        ? `已为你应用筛选(AI 暂不可用:${apiError})`
        : "已为你应用筛选,主区已更新。";
      const aiMsg = {
        role: "ai",
        content: renderAIBubble(replyText, []),
        rawText: replyText,
      };
      const finalMessages = [...messagesAfterUser, aiMsg];
      setMessages(finalMessages);
      persistCurrentChat(chatId, finalMessages);
      setCurrentChatPersisted(true);
      return;
    }

    // === 优先级 4:全部失败 → 引导 ===
    const guideMsg = {
      role: "ai",
      content: (
        <div>
          {apiError && (
            <div className="bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-[8px] p-2 mb-2 text-[11px] font-mono text-[#92400E]">
              ⚠ AI 错误: {apiError}
            </div>
          )}
          <div>试试这些问法:</div>
          <div className="mt-2 space-y-1 text-[12px] text-[var(--ink-2)]">
            <div>· 找所有 Buck 类、量产的产品</div>
            <div>· TPS54824 跟 LM5117 哪个更适合工业?</div>
            <div>· 3A 输出 Buck 选什么电感?</div>
            <div>· BQ24617 能做几节锂电?</div>
            <div>· 12V 转 3.3V 5A 推荐什么?</div>
          </div>
        </div>
      ),
      rawText: "示例问法",
    };
    const finalMessages = [...messagesAfterUser, guideMsg];
    setMessages(finalMessages);
    persistCurrentChat(chatId, finalMessages);
    setCurrentChatPersisted(true);
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
    <div
      className="font-body h-screen flex overflow-hidden p-2 gap-2 items-stretch"
      style={{ background: "#F1F1F4" }}
    >
      <FontLoader />

      {/* LeftSidebar 容器(带拖拽) */}
      <div className="relative flex-shrink-0 flex">
        <LeftSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentSection={currentSection}
          currentSubSection={currentSubSection}
          currentChatId={currentChatId}
          chatHistory={chatHistory}
          currentUser={currentUser}
          onSwitchUser={(uid) => {
            setCurrentUserId(uid);
            handleNewChat();  // 切换角色后回到首页(让用户看到新角色的视图)
          }}
          onNewChat={handleNewChat}
          onSelectSection={handleSelectSection}
          onSelectChat={handleSelectChat}
          width={240}
        />
      </div>

      {appState === "idle" ? (
        <IdleScreen
          onIntent={handleIntent}
          onOnboardingComplete={(projectType, refDescription, targetVersion) => {
            // 引导完成 → 切到 Working,主区显示 ChangePlan
            const aiMessages = [
              { role: "ai", content: <>欢迎来到 <strong>MP1582</strong> 工作台。改动清单已在主区,16 章每一行都标注了改动内容、难度和 AI 协作方式。</> },
              { role: "ai", content: <>你可以继续在这里跟我聊任何细节,或直接点主区 <strong>「开始编辑」</strong> 进入正文。</> },
            ];
            setIntentType("change-plan");
            setIntentPayload({
              product: "MP1582",
              projectType: projectType || "new",
              targetState: targetVersion || "draft",
              reference: { id: "ds-1", type: "datasheet", title: "MP1482 v1.2" },
            });
            setMessages(aiMessages);
            setCurrentChatId(`chat-${Date.now()}`);
            setCurrentSection("");
            setAppState("working");
          }}
        />
      ) : (
        <WorkingScreen
          intentType={intentType}
          intentPayload={intentPayload}
          messages={messages}
          inputValue={chatInput}
          onInputChange={setChatInput}
          onSubmit={handleWorkingSubmit}
          onBackToIdle={handleNewChat}
          onEnterEdit={() => {
            // ChangePlan → DocEdit
            setIntentType("doc-edit");
            setIntentPayload({
              product: intentPayload?.product || "MP1582",
              version: `${intentPayload?.targetState === "ga" ? "v1.0" : "v0.1"}-${intentPayload?.targetState || "draft"}`,
              template: "企业 Buck v2.3",
            });
            setMessages([
              ...messages,
              { role: "user", content: "开始编辑" },
              { kind: "task", state: "done", title: "已切换到编辑器", detail: "16 章模板已加载,左侧大纲可导航" },
              { role: "ai", content: <>编辑器已就绪。每个章节进入时,我会根据内容形态(<strong>文本/表格/图片</strong>)切换工具栏。开始时建议先做最难的 <strong>第 3 节描述</strong>。</> },
            ]);
          }}
          chatRatio={chatRatio}
          onChatRatioChange={setChatRatio}
        />
      )}
    </div>
    </CurrentUserContext.Provider>
  );
}
