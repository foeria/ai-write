#![cfg_attr(mobile, tauri::mobile_entry_point)]

mod database;
mod commands;

pub use database::Database;

pub fn run() {
    tauri::Builder::default()
        .manage(Database::new())
        .invoke_handler(tauri::generate_handler![
            commands::novel_create,
            commands::novel_get_all,
            commands::novel_get_by_id,
            commands::novel_update,
            commands::novel_delete,
            commands::chapter_create,
            commands::chapter_get_by_novel,
            commands::chapter_get_by_id,
            commands::chapter_update,
            commands::chapter_delete,
            commands::volume_create,
            commands::volume_get_by_novel,
            commands::volume_update,
            commands::volume_delete,
            commands::character_create,
            commands::character_get_all,
            commands::character_get_by_id,
            commands::character_update,
            commands::character_delete,
            commands::knowledge_create,
            commands::knowledge_get_all,
            commands::knowledge_get_by_id,
            commands::knowledge_update,
            commands::knowledge_delete,
            commands::knowledge_search,
            commands::entry_create,
            commands::entry_get_all,
            commands::entry_update,
            commands::entry_delete,
            commands::plot_card_create,
            commands::plot_card_get_by_novel,
            commands::plot_card_update,
            commands::plot_card_delete,
            commands::plot_card_reorder,
            commands::book_create,
            commands::book_get_all,
            commands::book_get_by_id,
            commands::book_update,
            commands::book_delete,
            commands::book_search,
            commands::book_update_reading_progress,
            commands::book_chapter_create,
            commands::book_chapters_get_by_book,
            commands::book_chapter_get_by_id,
            commands::book_chapter_update,
            commands::book_chapter_delete,
            commands::book_category_create,
            commands::book_category_get_all,
            commands::book_category_update,
            commands::book_category_delete,
            commands::book_bookmark_create,
            commands::book_bookmarks_get_by_book,
            commands::book_bookmark_delete,
            commands::book_note_create,
            commands::book_notes_get_by_book,
            commands::book_note_update,
            commands::book_note_delete,
            commands::book_settings_get,
            commands::book_settings_update,
            commands::read_text_file,
            // 提示词相关命令
            commands::prompt_create,
            commands::prompt_get_all,
            commands::prompt_get_by_id,
            commands::prompt_update,
            commands::prompt_delete,
            commands::prompt_increment_usage,
            commands::prompt_toggle_favorite,
            commands::prompt_get_favorites,
            commands::prompt_search,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
