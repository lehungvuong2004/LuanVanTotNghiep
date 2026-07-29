import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Pagination } from "../../../components/Pagination";
import { useToast } from "../../../contexts/ToastContext";
import { useChatbotKnowledge } from "./useHook";
import { createChatbotKnowledgeAdminApi, updateChatbotKnowledgeAdminApi, deleteChatbotKnowledgeAdminApi, importChatbotKnowledgeAdminApi, syncChatbotKnowledgeAdminApi } from "../../../api/chatbot";
import type { ChatbotKnowledge } from "../../../api/chatbot";

export const ChatbotKnowledgeBase = () => {
  const { showToast } = useToast();
  const {
    permissions,
    knowledges,
    loading,
    syncing,
    setSyncing,
    importing,
    setImporting,
    submitting,
    setSubmitting,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems,
    fetchKnowledges,
  } = useChatbotKnowledge();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChatbotKnowledge | null>(null);

  // Form states
  const [formKeyword, setFormKeyword] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formContent, setFormContent] = useState("");

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setFormKeyword("");
    setFormQuestion("");
    setFormContent("");
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: ChatbotKnowledge) => {
    setSelectedItem(item);
    setFormKeyword(item.keyword || "");
    setFormQuestion(item.question);
    setFormContent(item.content);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formContent.trim()) {
      showToast("error", "Lỗi dữ liệu", "Vui lòng nhập đầy đủ câu hỏi và nội dung tri thức.");
      return;
    }

    setSubmitting(true);
    try {
      if (selectedItem) {
        // Update
        const res = await updateChatbotKnowledgeAdminApi(selectedItem.id, {
          keyword: formKeyword.trim() || undefined,
          question: formQuestion.trim(),
          content: formContent.trim(),
        });
        showToast("success", "Cập nhật thành công", res.message || "Đã lưu thông tin tri thức.");
      } else {
        // Create
        const res = await createChatbotKnowledgeAdminApi({
          keyword: formKeyword.trim() || undefined,
          question: formQuestion.trim(),
          content: formContent.trim(),
        });
        showToast("success", "Thêm mới thành công", res.message || "Tạo tri thức RAG mới thành công.");
      }
      handleCloseModal();
      fetchKnowledges();
    } catch (error: any) {
      console.error("Error saving chatbot knowledge:", error);
      showToast("error", "Thao tác thất bại", error?.response?.data?.message || "Lỗi xử lý yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khối tri thức này?")) return;

    try {
      const res = await deleteChatbotKnowledgeAdminApi(id);
      showToast("success", "Đã xóa", res.message || "Xóa tri thức thành công.");
      fetchKnowledges();
    } catch (error: any) {
      console.error("Error deleting chatbot knowledge:", error);
      showToast("error", "Xóa thất bại", error?.response?.data?.message || "Lỗi xử lý yêu cầu.");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncChatbotKnowledgeAdminApi();
      showToast("success", "Đồng bộ RAG thành công", res.message || "Đã đẩy dữ liệu tri thức sang vector database.");
    } catch (error: any) {
      console.error("Error syncing chatbot knowledge:", error);
      showToast("error", "Đồng bộ thất bại", error?.response?.data?.message || "Lỗi đồng bộ dữ liệu.");
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".csv" && ext !== ".txt") {
      showToast("error", "Định dạng không hỗ trợ", "Hệ thống hỗ trợ tệp tin CSV (.csv) hoặc Text (.txt) encoding UTF-8.");
      return;
    }

    setImporting(true);
    try {
      const res = await importChatbotKnowledgeAdminApi(file);
      showToast("success", "Import hoàn tất", res.message || `Đã nạp thành công các câu hỏi vào RAG.`);
      e.target.value = "";
      setCurrentPage(1);
      fetchKnowledges();
    } catch (error: any) {
      console.error("Error importing file:", error);
      showToast("error", "Nạp tệp thất bại", error?.response?.data?.message || "Có lỗi xảy ra khi phân tích nội dung tệp CSV.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto min-h-screen text-slate-800 w-full dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Icon icon="material-symbols:smart-toy-outline-rounded" className="text-[#026E5F] text-3xl" />
            Quản Lý Tri Thức Chatbot (RAG)
          </h2>
          <p className="text-sm text-slate-505 dark:text-slate-400 mt-1">Thiết lập dữ liệu câu hỏi, câu trả lời cục bộ để AI (Gemini) tham chiếu trả lời khách hàng dưới dạng RAG.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {permissions.update && (
            <button
              onClick={handleSync}
              disabled={syncing || knowledges.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" /> : <Icon icon="material-symbols:sync-saved-locally-outline-rounded" className="text-base" />}
              Đồng bộ dữ liệu RAG
            </button>
          )}

          {permissions.create && (
            <label className="flex items-center gap-1.5 px-4 py-2.5 bg-[#026E5F] hover:bg-[#015247] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98">
              {importing ? <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" /> : <Icon icon="material-symbols:upload-file-outline-rounded" className="text-base" />}
              Nạp tệp Excel/CSV
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} disabled={importing} className="hidden" />
            </label>
          )}

          {permissions.create && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-900 hover:bg-cyan-950 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <Icon icon="material-symbols:add-circle-outline-rounded" className="text-base" />
              Thêm Tri Thức
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổng số tri thức RAG</span>
            <h3 className="text-3xl font-black text-slate-700 dark:text-slate-100 mt-1">{totalItems}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-105 dark:border-blue-900/30">
            <Icon icon="material-symbols:database-outline" className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trạng thái đồng bộ</span>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <Icon icon="material-symbols:check-circle-outline-rounded" />
              Sẵn sàng
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-105 dark:border-emerald-900/30">
            <Icon icon="material-symbols:cloud-done-outline-sharp" className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Tệp tin mẫu</span>
            <a href="/chatbot_sample.csv" download="chatbot_sample.csv" className="text-xs font-bold text-[#026E5F] dark:text-[#52c1b2] hover:underline mt-2 flex items-center gap-1">
              <Icon icon="material-symbols:download-outline-rounded" />
              Tải CSV mẫu (.csv)
            </a>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-955/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-105 dark:border-cyan-900/30">
            <Icon icon="material-symbols:table-chart-outline-sharp" className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between gap-4">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tìm kiếm dữ liệu tri thức của bạn</div>
        <div className="relative w-full max-w-md">
          <Icon icon="material-symbols:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, câu hỏi hoặc nội dung tri thức..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-202 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-cyan-900/20 focus:outline-hidden focus:border-cyan-900 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-12 flex flex-col items-center justify-center gap-4">
          <span className="w-10 h-10 border-4 border-slate-202 border-t-[#026E5F] rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-505 dark:text-slate-400">Đang tải tri thức chatbot...</span>
        </div>
      ) : knowledges.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-16 text-center">
          <Icon icon="material-symbols:database-off-outline" className="text-slate-300 dark:text-slate-600 text-6xl mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-350">Chưa nạp tri thức RAG</h4>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">Hệ thống chatbot chưa có tri thức cục bộ. Quý khách có thể nạp file CSV mẫu (keyword, question, content) hoặc tạo thủ công.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 font-bold text-xxs tracking-wider uppercase">
                  <th className="py-4 px-5 w-24">ID</th>
                  <th className="py-4 px-5 w-36">Chủ đề (Keyword)</th>
                  <th className="py-4 px-5">Câu hỏi phổ biến</th>
                  <th className="py-4 px-5">Nội dung phản hồi (Context)</th>
                  <th className="py-4 px-5 w-32">Người tạo</th>
                  <th className="py-4 px-5 text-right w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-101 dark:divide-slate-700/40 text-xs font-semibold text-slate-600 dark:text-slate-350">
                {knowledges.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-400">{k.id}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 bg-slate-105 dark:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-md font-mono text-xxs font-bold">{k.keyword || "none"}</span>
                    </td>
                    <td className="py-3.5 px-5 max-w-xs truncate" title={k.question}>
                      {k.question}
                    </td>
                    <td className="py-3.5 px-5 max-w-md truncate text-slate-500 dark:text-slate-400 font-medium" title={k.content}>
                      {k.content}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-medium">{k.creator?.full_name || "Hệ thống"}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {permissions.update && (
                          <button
                            onClick={() => handleOpenEditModal(k)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-750 text-cyan-600 dark:text-cyan-400 cursor-pointer transition-colors"
                            title="Sửa tri thức"
                          >
                            <Icon icon="material-symbols:edit-document-outline-sharp" className="text-lg" />
                          </button>
                        )}
                        {permissions.delete && (
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-955/20 text-red-655 dark:text-red-500 cursor-pointer transition-colors"
                            title="Xóa tri thức"
                          >
                            <Icon icon="material-symbols:delete-outline-rounded" className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      )}

      {/* Edit / Add Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-200 overflow-y-auto bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-101 dark:border-slate-700 overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-202 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Icon icon="material-symbols:menu-book-outline-rounded" className="text-[#026E5F] text-xl" />
                {selectedItem ? "Cập Nhật Khối Tri Thức" : "Tạo Mới Khối Tri Thức"}
              </h3>
              <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-202 cursor-pointer transition-colors">
                <Icon icon="material-symbols:close-rounded" className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xxs font-bold text-slate-450 dark:text-slate-500 uppercase">Chủ đề / Từ khóa chính (Keyword)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: gia ca, lien he, tre em,..."
                  value={formKeyword}
                  onChange={(e) => setFormKeyword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-202 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#026E5F]/20 focus:outline-hidden focus:border-[#026E5F] text-slate-700 dark:text-slate-200"
                />
                <span className="text-xs text-slate-400">Không bắt buộc. Giúp hệ thống dễ khớp ưu tiên tri thức hơn.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xxs font-bold text-slate-455 dark:text-slate-500 uppercase">Câu hỏi tham khảo (Question) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nhập câu hỏi mẫu mà khách hàng hay hỏi..."
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-202 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#026E5F]/20 focus:outline-hidden focus:border-[#026E5F] text-slate-705 dark:text-slate-202"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xxs font-bold text-slate-455 dark:text-slate-500 uppercase">Nội dung câu trả lời chuẩn (Context Content) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nội dung thông tin câu trả lời đầy đủ, chi tiết, chính xác làm tri thức gốc..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-202 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#026E5F]/20 focus:outline-hidden focus:border-[#026E5F] text-slate-705 dark:text-slate-202"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-202 dark:border-slate-700/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-202 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-slate-705 dark:text-slate-350"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 bg-[#026E5F] hover:bg-[#015247] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md active:scale-98 transition-all cursor-pointer"
              >
                {submitting && <Icon icon="line-md:loading-twotone-loop" className="text-base animate-spin" />}
                Lưu Tri Thức
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotKnowledgeBase;
