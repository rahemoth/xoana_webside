'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

interface MediaPickerDialogProps {
  open: boolean;
  title: string;
  hint?: string;
  onClose: () => void;
  onSelect: (src: string) => void;
  selected?: string;
  selectedMany?: string[];
}

// Rendered through a portal so it also works inside the settings page's disabled fieldset.
export function MediaPickerDialog({
  open,
  title,
  hint,
  onClose,
  onSelect,
  selected,
  selectedMany,
}: MediaPickerDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[60] flex max-h-[88vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-zinc-900 dark:text-white">{title}</Dialog.Title>
              {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
            </div>
            <Dialog.Close aria-label="关闭图片库" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <MediaLibrary onSelect={onSelect} selected={selected} selectedMany={selectedMany} />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              完成
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
