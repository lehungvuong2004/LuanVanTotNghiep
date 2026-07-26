import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { queryChatbot } from "../../api/chatbot";

export const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào! Cảm ơn bạn đã liên hệ Gia Đình Việt. Mình là trợ lý ảo hỗ trợ dịch vụ. Bạn đang cần tìm hiểu thông tin gì ạ?",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await queryChatbot(userText);
      let replyText = "Xin lỗi, hệ thống đang bận phản hồi. Bạn vui lòng thử lại sau ít phút!";
      if (response) {
        if (response.reply) {
          replyText = response.reply;
        } else if (response.data && response.data.reply) {
          replyText = response.data.reply;
        }
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("Chatbot logic API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Không thể kết nối đến máy chủ CSKH. Quý khách vui lòng thử lại sau!",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center">
      {/* Mini Chatbot Window overlay */}
      {isChatOpen && (
        <div className="fixed bottom-26 right-10 w-md max-w-[calc(100vw-2.5rem)] h-144 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-950 dark:border-slate-900 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#066d72] dark:bg-slate-700 px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 dark:bg-slate-600 rounded-full flex items-center justify-center relative">
                <Icon icon="material-symbols:support-agent-rounded" className="text-3xl" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-slate-800 animate-pulse" />
              </div>
              <div className="text-left font-semibold">
                <h4 className="font-bold text-base leading-tight">Trợ Lý Gia Đình Việt</h4>
                <p className="text-xs text-white/80 font-medium">Thường phản hồi ngay lập tức</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-white/10 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Đóng chat"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"} items-end gap-3`}>
                  {isBot && (
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-slate-750 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                      <Icon icon="icon-park-outline:family" className="text-xl text-[#066d72] dark:text-teal-400" />
                    </div>
                  )}
                  <div className="max-w-xs flex flex-col">
                    <div
                      className={`px-4 py-3 text-sm font-semibold rounded-2xl shadow-xs leading-relaxed ${
                        isBot
                          ? "bg-white text-slate-850 dark:bg-slate-850 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700/50"
                          : "bg-[#066d72] text-white rounded-br-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-xs text-slate-400 dark:text-slate-500 mt-1.5 ${isBot ? "text-left" : "text-right"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start items-end gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                  <Icon icon="icon-park-outline:family" className="text-xl text-[#066d72] dark:text-teal-400" />
                </div>
                <div className="max-w-xs flex flex-col">
                  <div className="px-4 py-3 text-sm font-semibold rounded-2xl shadow-xs bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700/50 flex gap-1 items-center">
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-3 shrink-0 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isLoading ? "Vui lòng chờ..." : "Nhập câu hỏi của bạn..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-850"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 bg-[#066d72] hover:bg-teal-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="Gửi tin nhắn"
            >
              <Icon icon="iconamoon:send-fill" className="text-xl" />
            </button>
          </form>
        </div>
      )}

      {/* Main Trigger Chatbot Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-expanded={isChatOpen}
        className="w-14 h-14 bg-[#066d72] hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-full shadow-xl hover:shadow-[#066d72]/45 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
        title="Hỗ trợ trực tuyến (CSKH)"
      >
        {isChatOpen ? (
          <Icon icon="lucide:x" className="text-3xl transition-transform duration-300" />
        ) : (
          <Icon icon="material-symbols:support-agent-rounded" className="text-3xl transition-transform duration-300" />
        )}
      </button>
    </div>
  );
};
