import { Icon } from "@iconify/react";
import { getRoleBadge } from "../../utils";
import { useChat } from "./useHook";

export const ChatPage = () => {
  const {
    partnerId,
    navigate,
    t,
    currentUser,
    messages,
    searchQuery,
    setSearchQuery,
    inputText,
    setInputText,
    sending,
    loadingHistory,
    loadingConversations,
    messagesEndRef,
    filteredConversations,
    activePartner,
    fetchChatHistory,
    handleSend,
    handleDeleteMessage,
  } = useChat();

  const renderConversations = () => {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Header & Search */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-750 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icon icon="material-symbols:chat-outline" className="text-teal-600 text-2xl" />
            {t("Hội thoại")}
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Tìm cuộc trò chuyện...")}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            />
            <Icon icon="material-symbols:search-rounded" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-750/30 p-2">
          {loadingConversations ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <Icon icon="line-md:loading-twotone-loop" className="text-3xl text-teal-600" />
              <span className="text-xs text-slate-400">{t("Đang tải hội thoại...")}</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
              <Icon icon="material-symbols:chat-bubble-outline-rounded" className="text-4xl mb-2" />
              <span className="text-sm font-medium">{t("Không tìm thấy cuộc trò chuyện nào.")}</span>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = Number(partnerId) === c.partner.id;
              const dateObj = new Date(c.last_message.created_at);
              const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={c.partner.id}
                  onClick={() => navigate(`/messages/${c.partner.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isActive ? "bg-teal-50/70 dark:bg-teal-950/20 border-teal-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {c.partner.avatar ? (
                      <img src={c.partner.avatar} alt={c.partner.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {c.partner.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {c.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        {c.unread_count}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{c.partner.full_name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{timeStr}</span>
                    </div>
                    <p className={`text-xs truncate ${c.unread_count > 0 ? "text-slate-900 dark:text-slate-200 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                      {c.last_message.sender_id === currentUser?.id ? `${t("Bạn")}: ` : ""}
                      {c.last_message.message}
                    </p>
                    <div className="mt-1 flex items-center justify-between">{c.partner.role && getRoleBadge(c.partner.role.name)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderChatWindow = () => {
    if (!activePartner) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Icon icon="material-symbols:chat-outline" className="text-4xl text-teal-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{t("Hộp thư nhắn tin")}</h3>
          <p className="text-xs max-w-sm leading-relaxed text-slate-400">{t("Chọn một đối tác trong danh sách bên trái hoặc truy cập trang cá nhân của họ để mở cuộc trò chuyện trực tiếp.")}</p>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
        {/* Header */}
        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/messages")} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500">
              <Icon icon="material-symbols:arrow-back-rounded" className="text-xl" />
            </button>

            <div className="relative">
              {activePartner.avatar ? (
                <img src={activePartner.avatar} alt={activePartner.full_name} className="w-10 h-10 rounded-full object-cover border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-base">
                  {activePartner.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{activePartner.full_name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {activePartner.role && getRoleBadge(activePartner.role.name)}
                <span className="text-xs text-slate-400">{activePartner.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => fetchChatHistory(Number(partnerId), true)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl text-slate-500 cursor-pointer transition-colors">
              <Icon icon="material-symbols:refresh-rounded" className="text-xl" />
            </button>
          </div>
        </div>

        {/* Message log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingHistory && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Icon icon="line-md:loading-twotone-loop" className="text-3xl text-teal-600" />
              <span className="text-xs text-slate-500">{t("Đang tải tin nhắn...")}</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.sender_id === currentUser?.id;
              const dateObj = new Date(msg.created_at);
              const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={msg.id} className={`flex gap-3 max-w-[80%] group ${isSelf ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  {/* Partner avatar */}
                  {!isSelf && (
                    <div className="shrink-0 self-end">
                      {activePartner.avatar ? (
                        <img src={activePartner.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">{activePartner.full_name.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-end gap-2">
                      <div
                        className={`p-3 rounded-2xl text-sm relative wrap-break-word shadow-xs ${
                          isSelf
                            ? "bg-teal-600 text-white rounded-br-none"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/50 rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>

                      {/* Delete message button */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-500 hover:text-red-600 transition-all cursor-pointer text-sm self-center"
                        title={t("Xóa tin nhắn")}
                      >
                        <Icon icon="material-symbols:delete-outline-rounded" />
                      </button>
                    </div>

                    <div className={`text-xs text-slate-400 px-1 ${isSelf ? "text-right" : "text-left"}`}>
                      {timeStr}
                      {isSelf && <span className="ml-1 text-teal-600 font-semibold">{msg.is_read ? t("• Đã xem") : t("• Đã gửi")}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input section */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-750">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("Nhập tin nhắn...")}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-3 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md hover:shadow-teal-600/20"
            >
              {sending ? <Icon icon="line-md:loading-twotone-loop" className="text-xl" /> : <Icon icon="material-symbols:send-rounded" className="text-xl" />}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-7.5rem)] bg-slate-50 dark:bg-slate-900 flex justify-center py-6 px-4 md:px-8">
      <div className="w-full max-w-7xl h-192 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className={`md:col-span-1 border-r border-slate-100 dark:border-slate-750 h-full overflow-hidden ${partnerId ? "hidden md:flex" : "flex flex-col"}`}>{renderConversations()}</div>
        <div className={`md:col-span-2 lg:col-span-3 h-full overflow-hidden ${!partnerId ? "hidden md:flex" : "flex flex-col"}`}>{renderChatWindow()}</div>
      </div>
    </div>
  );
};
