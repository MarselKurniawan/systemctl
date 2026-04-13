-- Hapus semua chat messages terlebih dahulu (karena foreign key ke consultations)
DELETE FROM public.chat_messages;

-- Hapus semua data konsultasi
DELETE FROM public.consultations;