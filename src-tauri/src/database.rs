use rusqlite::{Connection, Result};
use std::sync::Mutex;
use once_cell::sync::Lazy;

pub struct Database {
    conn: Mutex<Connection>,
}

pub static DB: Lazy<Database> = Lazy::new(|| {
    Database::new()
});

impl Database {
    /// 创建数据库实例
    pub fn new() -> Self {
        // 将 DB 放到项目根目录下的 data/ （src-tauri/ 的上一级）
        // 避免放在 src-tauri/ 内被 Tauri 文件监考器触发无限重编译
        let exe_dir = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.to_path_buf()))
            .unwrap_or_else(|| std::path::PathBuf::from("."));

        // dev 模式下 exe 在 src-tauri/target/debug/，向上三层到项目根
        // release 模式下 exe 在安装目录，直接放到同级目录下
        let data_dir = if exe_dir.ends_with("debug") || exe_dir.ends_with("release") {
            // dev/release 构建：src-tauri/target/debug/ → 项目根/data/
            exe_dir
                .parent() // target/debug → src-tauri/target
                .and_then(|p| p.parent()) // target → src-tauri
                .and_then(|p| p.parent()) // src-tauri → 项目根
                .map(|p| p.join("data"))
                .unwrap_or_else(|| exe_dir.join("data"))
        } else {
            exe_dir.join("data")
        };

        let db_path = data_dir.join("ai-write.db");

        // 创建目录
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path).expect("Failed to open database");

        // 关闭外键约束（避免 localStorage 迁移期间 novel_id 不存在导致的 FK 错误）
        conn.execute_batch("PRAGMA foreign_keys = OFF;")
            .expect("Failed to set pragmas");

        println!("[Database] 打开数据库: {:?}", db_path);

        // 初始化表结构
        Self::init_schema(&conn);

        Database {
            conn: Mutex::new(conn),
        }
    }

    /// 初始化数据库表结构
    fn init_schema(conn: &Connection) {
        // 小说表（先建表，再迁移字段，避免全新数据库时出现无意义的警告）
        conn.execute(
            "CREATE TABLE IF NOT EXISTS novels (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                genre TEXT,
                category TEXT,
                tags TEXT,
                author TEXT,
                status TEXT DEFAULT 'draft',
                target_words INTEGER DEFAULT 300000,
                content_rating TEXT DEFAULT 'general',
                cover_image TEXT,
                outline TEXT,
                world_building TEXT,
                theme TEXT,
                style TEXT,
                tone TEXT,
                era TEXT,
                location TEXT,
                world_type TEXT,
                core_hook TEXT,
                main_tags TEXT,
                sub_tags TEXT,
                target_audience TEXT,
                protagonist_name TEXT,
                protagonist_age TEXT,
                protagonist_background TEXT,
                protagonist_goal TEXT,
                world_architecture TEXT,
                power_system TEXT,
                golden_finger TEXT,
                is_part_of_series INTEGER DEFAULT 0,
                series_name TEXT,
                book_number INTEGER DEFAULT 1,
                total_books INTEGER DEFAULT 1,
                word_count INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER
            )",
            [],
        ).expect("Failed to create novels table");

        // 为旧版数据库添加缺失的字段（全新数据库此步骤无操作）
        Self::migrate_novels_table(conn);

        // 章节表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS chapters (
                id TEXT PRIMARY KEY,
                novel_id TEXT NOT NULL,
                volume_id TEXT,
                title TEXT NOT NULL,
                content TEXT,
                outline TEXT,
                order_index INTEGER DEFAULT 0,
                word_count INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create chapters table");

        // 卷表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS volumes (
                id TEXT PRIMARY KEY,
                novel_id TEXT NOT NULL,
                title TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create volumes table");

        // 人物表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS characters (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                gender TEXT,
                age TEXT,
                appearance TEXT,
                personality TEXT,
                background TEXT,
                novel_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create characters table");

        // 知识库表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS knowledge (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT,
                content TEXT,
                tags TEXT,
                novel_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create knowledge table");

        // 写作进度表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS writing_progress (
                id TEXT PRIMARY KEY,
                novel_id TEXT NOT NULL,
                current_chapter_id TEXT,
                total_chapters INTEGER DEFAULT 0,
                completed_chapters INTEGER DEFAULT 0,
                daily_word_count INTEGER DEFAULT 0,
                last_written_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create writing_progress table");

        // 词条表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS entries (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                description TEXT,
                novel_id TEXT,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create entries table");

        // 剧情卡片表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS plot_cards (
                id TEXT PRIMARY KEY,
                novel_id TEXT NOT NULL,
                description TEXT,
                mood TEXT,
                importance TEXT,
                goal TEXT,
                order_index INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create plot_cards table");

        // 索引
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON chapters(volume_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_volumes_novel_id ON volumes(novel_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_characters_novel_id ON characters(novel_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_novel_id ON knowledge(novel_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_entries_novel_id ON entries(novel_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_writing_progress_novel_id ON writing_progress(novel_id)", []).ok();

        // 书籍表 (用于电子书阅读)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT,
                cover_image TEXT,
                file_path TEXT,
                file_type TEXT,
                category_id TEXT,
                description TEXT,
                total_chapters INTEGER DEFAULT 0,
                current_chapter INTEGER DEFAULT 0,
                current_position INTEGER DEFAULT 0,
                word_count INTEGER DEFAULT 0,
                is_pinned INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                last_read_at INTEGER
            )",
            [],
        ).expect("Failed to create books table");

        // 书籍章节表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS book_chapters (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                order_index INTEGER DEFAULT 0,
                word_count INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create book_chapters table");

        // 书籍分类表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS book_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT,
                created_at INTEGER,
                updated_at INTEGER
            )",
            [],
        ).expect("Failed to create book_categories table");

        // 书签表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS book_bookmarks (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                chapter_id TEXT,
                position INTEGER DEFAULT 0,
                title TEXT,
                note TEXT,
                created_at INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (chapter_id) REFERENCES book_chapters(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create book_bookmarks table");

        // 书籍笔记表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS book_notes (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                chapter_id TEXT,
                content TEXT,
                highlighted_text TEXT,
                page_position INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (chapter_id) REFERENCES book_chapters(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create book_notes table");

        // 书籍阅读设置表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS book_settings (
                id TEXT PRIMARY KEY,
                font_size INTEGER DEFAULT 18,
                line_height REAL DEFAULT 1.8,
                theme TEXT DEFAULT 'sepia',
                font_family TEXT DEFAULT 'system-ui',
                created_at INTEGER,
                updated_at INTEGER
            )",
            [],
        ).expect("Failed to create book_settings table");

        // 书籍索引
        conn.execute("CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON book_bookmarks(book_id)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_book_id ON book_notes(book_id)", []).ok();

        // 提示词表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                tags TEXT,
                is_favorite INTEGER DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                is_featured INTEGER DEFAULT 0,
                is_builtin INTEGER DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER
            )",
            [],
        ).expect("Failed to create prompts table");

        // 提示词收藏表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS prompt_favorites (
                id TEXT PRIMARY KEY,
                prompt_id TEXT NOT NULL,
                created_at INTEGER,
                FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
            )",
            [],
        ).expect("Failed to create prompt_favorites table");

        conn.execute("CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category)", []).ok();
        conn.execute("CREATE INDEX IF NOT EXISTS idx_prompt_favorites_prompt_id ON prompt_favorites(prompt_id)", []).ok();
    }

    /// 数据库迁移：为 novels 表添加新字段
    fn migrate_novels_table(conn: &Connection) {
        let migrations = vec![
            ("category", "ALTER TABLE novels ADD COLUMN category TEXT"),
            ("tags", "ALTER TABLE novels ADD COLUMN tags TEXT"),
            ("author", "ALTER TABLE novels ADD COLUMN author TEXT"),
            ("status", "ALTER TABLE novels ADD COLUMN status TEXT DEFAULT 'draft'"),
            ("target_words", "ALTER TABLE novels ADD COLUMN target_words INTEGER DEFAULT 300000"),
            ("content_rating", "ALTER TABLE novels ADD COLUMN content_rating TEXT DEFAULT 'general'"),
            ("theme", "ALTER TABLE novels ADD COLUMN theme TEXT"),
            ("style", "ALTER TABLE novels ADD COLUMN style TEXT"),
            ("tone", "ALTER TABLE novels ADD COLUMN tone TEXT"),
            ("era", "ALTER TABLE novels ADD COLUMN era TEXT"),
            ("location", "ALTER TABLE novels ADD COLUMN location TEXT"),
            ("world_type", "ALTER TABLE novels ADD COLUMN world_type TEXT"),
            ("core_hook", "ALTER TABLE novels ADD COLUMN core_hook TEXT"),
            ("main_tags", "ALTER TABLE novels ADD COLUMN main_tags TEXT"),
            ("sub_tags", "ALTER TABLE novels ADD COLUMN sub_tags TEXT"),
            ("target_audience", "ALTER TABLE novels ADD COLUMN target_audience TEXT"),
            ("protagonist_name", "ALTER TABLE novels ADD COLUMN protagonist_name TEXT"),
            ("protagonist_age", "ALTER TABLE novels ADD COLUMN protagonist_age TEXT"),
            ("protagonist_background", "ALTER TABLE novels ADD COLUMN protagonist_background TEXT"),
            ("protagonist_goal", "ALTER TABLE novels ADD COLUMN protagonist_goal TEXT"),
            ("world_architecture", "ALTER TABLE novels ADD COLUMN world_architecture TEXT"),
            ("power_system", "ALTER TABLE novels ADD COLUMN power_system TEXT"),
            ("golden_finger", "ALTER TABLE novels ADD COLUMN golden_finger TEXT"),
            ("is_part_of_series", "ALTER TABLE novels ADD COLUMN is_part_of_series INTEGER DEFAULT 0"),
            ("series_name", "ALTER TABLE novels ADD COLUMN series_name TEXT"),
            ("book_number", "ALTER TABLE novels ADD COLUMN book_number INTEGER DEFAULT 1"),
            ("total_books", "ALTER TABLE novels ADD COLUMN total_books INTEGER DEFAULT 1"),
        ];

        for (column, sql) in migrations {
            // 检查列是否存在
            let check_sql = format!("SELECT {} FROM novels LIMIT 1", column);
            if conn.execute(&check_sql, []).is_err() {
                // 列不存在，添加它
                if let Err(e) = conn.execute(sql, []) {
                    eprintln!("Migration warning: Failed to add column {}: {}", column, e);
                }
            }
        }
    }

    /// 通用查询方法
    pub fn query<F, T>(&self, sql: &str, params: &[&dyn rusqlite::ToSql], mapper: F) -> Result<T>
    where
        F: FnOnce(&rusqlite::Statement) -> T,
    {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(sql)?;
        Ok(mapper(&mut stmt))
    }

    /// 通用执行方法
    pub fn execute(&self, sql: &str, params: &[&dyn rusqlite::ToSql]) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        conn.execute(sql, params).map_err(Into::into)
    }

    /// 获取连接用于事务操作
    pub fn get_connection(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.conn.lock().unwrap()
    }
}
