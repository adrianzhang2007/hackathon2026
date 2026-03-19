'use client';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export default function Modal({
  show,
  onClose,
  title,
  message,
  icon = '🎭',
  confirmText = '确定',
  cancelText,
  onConfirm
}: ModalProps) {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="font-serif text-2xl font-semibold text-[#2c2824] mb-3">{title}</h3>
          <p className="text-[#5c5650] mb-6">{message}</p>
          <div className="flex gap-3">
            {cancelText && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-[#e8e4df] text-[#5c5650] rounded-lg hover:bg-[#faf8f5] transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
