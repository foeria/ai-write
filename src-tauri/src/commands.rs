use crate::database::DB;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Novel {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub genre: Option<String>,          // 分类
    pub category: Option<String>,       // 作品分类（细分）
    pub tags: Option<String>,           // 标签
    pub author: Option<String>,          // 作者
    pub status: Option<String>,          // 状态：draft, writing, completed, paused
    pub target_words: Option<i64>,       // 目标字数
    pub content_rating: Option<String>,  // 内容分级
    pub cover_image: Option<String>,
    pub outline: Option<String>,
    pub world_building: Option<String>,
    pub theme: Option<String>,           // 主题
    pub style: Option<String>,            // 写作风格
    pub tone: Option<String>,             // 整体基调
    pub era: Option<String>,              // 时代背景
    pub location: Option<String>,         // 地点设定
    pub world_type: Option<String>,       // 世界类型
    pub core_hook: Option<String>,        // 核心梗概
    pub main_tags: Option<String>,        // 主标签
    pub sub_tags: Option<String>,         // 辅标签
    pub target_audience: Option<String>,  // 目标读者
    pub protagonist_name: Option<String>, // 主角名称
    pub protagonist_age: Option<String>,  // 主角年龄
    pub protagonist_background: Option<String>, // 主角背景
    pub protagonist_goal: Option<String>, // 主角目标
    pub world_architecture: Option<String>, // 世界观架构
    pub power_system: Option<String>,     // 力量体系
    pub golden_finger: Option<String>,    // 金手指
    pub is_part_of_series: Option<bool>,  // 是否系列作品
    pub series_name: Option<String>,       // 系列名称
    pub book_number: Option<i64>,          // 本书册数
    pub total_books: Option<i64>,         // 总册数
    pub word_count: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    pub id: String,
    pub novel_id: String,
    pub volume_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub outline: Option<String>,
    pub order_index: i64,
    pub word_count: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Volume {
    pub id: String,
    pub novel_id: String,
    pub title: String,
    pub order_index: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub id: String,
    pub name: String,
    pub gender: Option<String>,
    pub age: Option<String>,
    pub appearance: Option<String>,
    pub personality: Option<String>,
    pub background: Option<String>,
    pub novel_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Knowledge {
    pub id: String,
    pub title: String,
    pub category: Option<String>,
    pub content: Option<String>,
    pub tags: Option<String>,
    pub novel_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub id: String,
    pub name: String,
    pub category: Option<String>,
    pub description: Option<String>,
    pub novel_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlotCard {
    pub id: String,
    pub novel_id: String,
    pub description: Option<String>,
    pub mood: Option<String>,
    pub importance: Option<String>,
    pub goal: Option<String>,
    pub order_index: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

// Helper macro to convert rusqlite error to string
macro_rules! map_err {
    ($e:expr) => {
        $e.map_err(|e: rusqlite::Error| e.to_string())
    };
}

// ============ 书籍类型定义 ============

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub cover_image: Option<String>,
    pub file_path: Option<String>,
    pub file_type: Option<String>,
    pub category_id: Option<String>,
    pub description: Option<String>,
    pub total_chapters: i64,
    pub current_chapter: i64,
    pub current_position: i64,
    pub word_count: i64,
    pub is_pinned: i32,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_read_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookChapter {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub content: Option<String>,
    pub order_index: i64,
    pub word_count: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookCategory {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookBookmark {
    pub id: String,
    pub book_id: String,
    pub chapter_id: Option<String>,
    pub position: i64,
    pub title: Option<String>,
    pub note: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookNote {
    pub id: String,
    pub book_id: String,
    pub chapter_id: Option<String>,
    pub content: Option<String>,
    pub highlighted_text: Option<String>,
    pub page_position: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookSettings {
    pub id: String,
    pub font_size: i32,
    pub line_height: f64,
    pub theme: Option<String>,
    pub font_family: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============ 小说操作 ============

#[tauri::command]
pub fn novel_create(_state: State<'_, crate::database::Database>, novel: Novel) -> Result<Novel, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let novel = Novel {
        created_at: now,
        updated_at: now,
        status: Some(novel.status.unwrap_or_else(|| "draft".to_string())),
        target_words: Some(novel.target_words.unwrap_or(300000)),
        content_rating: Some(novel.content_rating.unwrap_or_else(|| "general".to_string())),
        is_part_of_series: Some(novel.is_part_of_series.unwrap_or(false)),
        book_number: Some(novel.book_number.unwrap_or(1)),
        total_books: Some(novel.total_books.unwrap_or(1)),
        ..novel
    };

    let sql = r#"
        INSERT INTO novels (id, title, description, genre, category, tags, author, status, target_words,
            content_rating, cover_image, outline, world_building, theme, style, tone, era, location,
            world_type, core_hook, main_tags, sub_tags, target_audience, protagonist_name, protagonist_age,
            protagonist_background, protagonist_goal, world_architecture, power_system, golden_finger,
            is_part_of_series, series_name, book_number, total_books, word_count, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20,
            ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34, ?35, ?36, ?37, ?38)
    "#;

    // 创建绑定以避免临时值问题
    let description = novel.description.as_deref().unwrap_or("").to_string();
    let genre = novel.genre.as_deref().unwrap_or("").to_string();
    let category = novel.category.as_deref().unwrap_or("").to_string();
    let tags = novel.tags.as_deref().unwrap_or("").to_string();
    let author = novel.author.as_deref().unwrap_or("").to_string();
    let status = novel.status.as_deref().unwrap_or("draft").to_string();
    let target_words = novel.target_words.unwrap_or(300000);
    let content_rating = novel.content_rating.as_deref().unwrap_or("general").to_string();
    let cover_image = novel.cover_image.as_deref().unwrap_or("").to_string();
    let outline = novel.outline.as_deref().unwrap_or("").to_string();
    let world_building = novel.world_building.as_deref().unwrap_or("").to_string();
    let theme = novel.theme.as_deref().unwrap_or("").to_string();
    let style = novel.style.as_deref().unwrap_or("").to_string();
    let tone = novel.tone.as_deref().unwrap_or("").to_string();
    let era = novel.era.as_deref().unwrap_or("").to_string();
    let location = novel.location.as_deref().unwrap_or("").to_string();
    let world_type = novel.world_type.as_deref().unwrap_or("").to_string();
    let core_hook = novel.core_hook.as_deref().unwrap_or("").to_string();
    let main_tags = novel.main_tags.as_deref().unwrap_or("").to_string();
    let sub_tags = novel.sub_tags.as_deref().unwrap_or("").to_string();
    let target_audience = novel.target_audience.as_deref().unwrap_or("").to_string();
    let protagonist_name = novel.protagonist_name.as_deref().unwrap_or("").to_string();
    let protagonist_age = novel.protagonist_age.as_deref().unwrap_or("").to_string();
    let protagonist_background = novel.protagonist_background.as_deref().unwrap_or("").to_string();
    let protagonist_goal = novel.protagonist_goal.as_deref().unwrap_or("").to_string();
    let world_architecture = novel.world_architecture.as_deref().unwrap_or("").to_string();
    let power_system = novel.power_system.as_deref().unwrap_or("").to_string();
    let golden_finger = novel.golden_finger.as_deref().unwrap_or("").to_string();
    let is_part_of_series = novel.is_part_of_series.unwrap_or(false) as i32;
    let series_name = novel.series_name.as_deref().unwrap_or("").to_string();
    let book_number = novel.book_number.unwrap_or(1);
    let total_books = novel.total_books.unwrap_or(1);

    let params: Vec<&dyn rusqlite::ToSql> = vec![
        &novel.id,
        &novel.title,
        &description,
        &genre,
        &category,
        &tags,
        &author,
        &status,
        &target_words,
        &content_rating,
        &cover_image,
        &outline,
        &world_building,
        &theme,
        &style,
        &tone,
        &era,
        &location,
        &world_type,
        &core_hook,
        &main_tags,
        &sub_tags,
        &target_audience,
        &protagonist_name,
        &protagonist_age,
        &protagonist_background,
        &protagonist_goal,
        &world_architecture,
        &power_system,
        &golden_finger,
        &is_part_of_series,
        &series_name,
        &book_number,
        &total_books,
        &novel.word_count,
        &novel.created_at,
        &novel.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(novel)
}

#[tauri::command]
pub fn novel_get_all(_state: State<'_, crate::database::Database>) -> Result<Vec<Novel>, String> {
    let sql = "SELECT id, title, description, genre, category, tags, author, status, target_words,
        content_rating, cover_image, outline, world_building, theme, style, tone, era, location,
        world_type, core_hook, main_tags, sub_tags, target_audience, protagonist_name, protagonist_age,
        protagonist_background, protagonist_goal, world_architecture, power_system, golden_finger,
        is_part_of_series, series_name, book_number, total_books, word_count, created_at, updated_at
        FROM novels ORDER BY updated_at DESC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let novel_iter = map_err!(stmt.query_map([], |row| {
        Ok(Novel {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            genre: row.get(3)?,
            category: row.get(4)?,
            tags: row.get(5)?,
            author: row.get(6)?,
            status: row.get(7)?,
            target_words: row.get(8)?,
            content_rating: row.get(9)?,
            cover_image: row.get(10)?,
            outline: row.get(11)?,
            world_building: row.get(12)?,
            theme: row.get(13)?,
            style: row.get(14)?,
            tone: row.get(15)?,
            era: row.get(16)?,
            location: row.get(17)?,
            world_type: row.get(18)?,
            core_hook: row.get(19)?,
            main_tags: row.get(20)?,
            sub_tags: row.get(21)?,
            target_audience: row.get(22)?,
            protagonist_name: row.get(23)?,
            protagonist_age: row.get(24)?,
            protagonist_background: row.get(25)?,
            protagonist_goal: row.get(26)?,
            world_architecture: row.get(27)?,
            power_system: row.get(28)?,
            golden_finger: row.get(29)?,
            is_part_of_series: row.get(30)?,
            series_name: row.get(31)?,
            book_number: row.get(32)?,
            total_books: row.get(33)?,
            word_count: row.get(34)?,
            created_at: row.get(35)?,
            updated_at: row.get(36)?,
        })
    }))?;

    let mut novels = Vec::new();
    for novel in novel_iter {
        novels.push(map_err!(novel)?);
    }
    Ok(novels)
}

#[tauri::command]
pub fn novel_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Novel>, String> {
    let sql = "SELECT id, title, description, genre, category, tags, author, status, target_words,
        content_rating, cover_image, outline, world_building, theme, style, tone, era, location,
        world_type, core_hook, main_tags, sub_tags, target_audience, protagonist_name, protagonist_age,
        protagonist_background, protagonist_goal, world_architecture, power_system, golden_finger,
        is_part_of_series, series_name, book_number, total_books, word_count, created_at, updated_at
        FROM novels WHERE id = ?1";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Novel {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            genre: row.get(3)?,
            category: row.get(4)?,
            tags: row.get(5)?,
            author: row.get(6)?,
            status: row.get(7)?,
            target_words: row.get(8)?,
            content_rating: row.get(9)?,
            cover_image: row.get(10)?,
            outline: row.get(11)?,
            world_building: row.get(12)?,
            theme: row.get(13)?,
            style: row.get(14)?,
            tone: row.get(15)?,
            era: row.get(16)?,
            location: row.get(17)?,
            world_type: row.get(18)?,
            core_hook: row.get(19)?,
            main_tags: row.get(20)?,
            sub_tags: row.get(21)?,
            target_audience: row.get(22)?,
            protagonist_name: row.get(23)?,
            protagonist_age: row.get(24)?,
            protagonist_background: row.get(25)?,
            protagonist_goal: row.get(26)?,
            world_architecture: row.get(27)?,
            power_system: row.get(28)?,
            golden_finger: row.get(29)?,
            is_part_of_series: row.get(30)?,
            series_name: row.get(31)?,
            book_number: row.get(32)?,
            total_books: row.get(33)?,
            word_count: row.get(34)?,
            created_at: row.get(35)?,
            updated_at: row.get(36)?,
        })
    })) {
        Ok(novel) => Ok(Some(novel)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn novel_update(_state: State<'_, crate::database::Database>, novel: Novel) -> Result<Novel, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE novels
        SET title = ?1, description = ?2, genre = ?3, category = ?4, tags = ?5, author = ?6, status = ?7,
            target_words = ?8, content_rating = ?9, cover_image = ?10, outline = ?11, world_building = ?12,
            theme = ?13, style = ?14, tone = ?15, era = ?16, location = ?17, world_type = ?18,
            core_hook = ?19, main_tags = ?20, sub_tags = ?21, target_audience = ?22,
            protagonist_name = ?23, protagonist_age = ?24, protagonist_background = ?25, protagonist_goal = ?26,
            world_architecture = ?27, power_system = ?28, golden_finger = ?29,
            is_part_of_series = ?30, series_name = ?31, book_number = ?32, total_books = ?33,
            word_count = ?34, updated_at = ?35
        WHERE id = ?36
    "#;

    // 创建绑定以避免临时值问题
    let description = novel.description.as_deref().unwrap_or("").to_string();
    let genre = novel.genre.as_deref().unwrap_or("").to_string();
    let category = novel.category.as_deref().unwrap_or("").to_string();
    let tags = novel.tags.as_deref().unwrap_or("").to_string();
    let author = novel.author.as_deref().unwrap_or("").to_string();
    let status = novel.status.as_deref().unwrap_or("draft").to_string();
    let target_words = novel.target_words.unwrap_or(300000);
    let content_rating = novel.content_rating.as_deref().unwrap_or("general").to_string();
    let cover_image = novel.cover_image.as_deref().unwrap_or("").to_string();
    let outline = novel.outline.as_deref().unwrap_or("").to_string();
    let world_building = novel.world_building.as_deref().unwrap_or("").to_string();
    let theme = novel.theme.as_deref().unwrap_or("").to_string();
    let style = novel.style.as_deref().unwrap_or("").to_string();
    let tone = novel.tone.as_deref().unwrap_or("").to_string();
    let era = novel.era.as_deref().unwrap_or("").to_string();
    let location = novel.location.as_deref().unwrap_or("").to_string();
    let world_type = novel.world_type.as_deref().unwrap_or("").to_string();
    let core_hook = novel.core_hook.as_deref().unwrap_or("").to_string();
    let main_tags = novel.main_tags.as_deref().unwrap_or("").to_string();
    let sub_tags = novel.sub_tags.as_deref().unwrap_or("").to_string();
    let target_audience = novel.target_audience.as_deref().unwrap_or("").to_string();
    let protagonist_name = novel.protagonist_name.as_deref().unwrap_or("").to_string();
    let protagonist_age = novel.protagonist_age.as_deref().unwrap_or("").to_string();
    let protagonist_background = novel.protagonist_background.as_deref().unwrap_or("").to_string();
    let protagonist_goal = novel.protagonist_goal.as_deref().unwrap_or("").to_string();
    let world_architecture = novel.world_architecture.as_deref().unwrap_or("").to_string();
    let power_system = novel.power_system.as_deref().unwrap_or("").to_string();
    let golden_finger = novel.golden_finger.as_deref().unwrap_or("").to_string();
    let is_part_of_series = novel.is_part_of_series.unwrap_or(false) as i32;
    let series_name = novel.series_name.as_deref().unwrap_or("").to_string();
    let book_number = novel.book_number.unwrap_or(1);
    let total_books = novel.total_books.unwrap_or(1);

    let params: Vec<&dyn rusqlite::ToSql> = vec![
        &novel.title,
        &description,
        &genre,
        &category,
        &tags,
        &author,
        &status,
        &target_words,
        &content_rating,
        &cover_image,
        &outline,
        &world_building,
        &theme,
        &style,
        &tone,
        &era,
        &location,
        &world_type,
        &core_hook,
        &main_tags,
        &sub_tags,
        &target_audience,
        &protagonist_name,
        &protagonist_age,
        &protagonist_background,
        &protagonist_goal,
        &world_architecture,
        &power_system,
        &golden_finger,
        &is_part_of_series,
        &series_name,
        &book_number,
        &total_books,
        &novel.word_count,
        &now,
        &novel.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Novel { updated_at: now, ..novel })
}

#[tauri::command]
pub fn novel_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM novels WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 章节操作 ============

#[tauri::command]
pub fn chapter_create(_state: State<'_, crate::database::Database>, chapter: Chapter) -> Result<Chapter, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let chapter = Chapter {
        created_at: now,
        updated_at: now,
        ..chapter
    };

    let sql = r#"
        INSERT INTO chapters (id, novel_id, volume_id, title, content, outline, order_index, word_count, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    "#;

    let params: [&dyn rusqlite::ToSql; 10] = [
        &chapter.id,
        &chapter.novel_id,
        &chapter.volume_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.title,
        &chapter.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.outline.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.order_index,
        &chapter.word_count,
        &chapter.created_at,
        &chapter.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(chapter)
}

#[tauri::command]
pub fn chapter_get_by_novel(_state: State<'_, crate::database::Database>, novel_id: String) -> Result<Vec<Chapter>, String> {
    let sql = "SELECT id, novel_id, volume_id, title, content, outline, order_index, word_count, created_at, updated_at FROM chapters WHERE novel_id = ?1 ORDER BY order_index ASC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let chapter_iter = map_err!(stmt.query_map([&novel_id], |row| {
        Ok(Chapter {
            id: row.get(0)?,
            novel_id: row.get(1)?,
            volume_id: row.get(2)?,
            title: row.get(3)?,
            content: row.get(4)?,
            outline: row.get(5)?,
            order_index: row.get(6)?,
            word_count: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    }))?;

    let mut chapters = Vec::new();
    for chapter in chapter_iter {
        chapters.push(map_err!(chapter)?);
    }
    Ok(chapters)
}

#[tauri::command]
pub fn chapter_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Chapter>, String> {
    let sql = "SELECT id, novel_id, volume_id, title, content, outline, order_index, word_count, created_at, updated_at FROM chapters WHERE id = ?1";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Chapter {
            id: row.get(0)?,
            novel_id: row.get(1)?,
            volume_id: row.get(2)?,
            title: row.get(3)?,
            content: row.get(4)?,
            outline: row.get(5)?,
            order_index: row.get(6)?,
            word_count: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })) {
        Ok(chapter) => Ok(Some(chapter)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn chapter_update(_state: State<'_, crate::database::Database>, chapter: Chapter) -> Result<Chapter, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE chapters
        SET title = ?1, content = ?2, outline = ?3, volume_id = ?4, order_index = ?5, word_count = ?6, updated_at = ?7
        WHERE id = ?8
    "#;

    let params: [&dyn rusqlite::ToSql; 8] = [
        &chapter.title,
        &chapter.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.outline.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.volume_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.order_index,
        &chapter.word_count,
        &now,
        &chapter.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Chapter { updated_at: now, ..chapter })
}

#[tauri::command]
pub fn chapter_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM chapters WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 卷操作 ============

#[tauri::command]
pub fn volume_create(_state: State<'_, crate::database::Database>, volume: Volume) -> Result<Volume, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let volume = Volume {
        created_at: now,
        updated_at: now,
        ..volume
    };

    let sql = r#"
        INSERT INTO volumes (id, novel_id, title, order_index, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    "#;

    let params: [&dyn rusqlite::ToSql; 6] = [
        &volume.id,
        &volume.novel_id,
        &volume.title,
        &volume.order_index,
        &volume.created_at,
        &volume.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(volume)
}

#[tauri::command]
pub fn volume_get_by_novel(_state: State<'_, crate::database::Database>, novel_id: String) -> Result<Vec<Volume>, String> {
    let sql = "SELECT id, novel_id, title, order_index, created_at, updated_at FROM volumes WHERE novel_id = ?1 ORDER BY order_index ASC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let volume_iter = map_err!(stmt.query_map([&novel_id], |row| {
        Ok(Volume {
            id: row.get(0)?,
            novel_id: row.get(1)?,
            title: row.get(2)?,
            order_index: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }))?;

    let mut volumes = Vec::new();
    for volume in volume_iter {
        volumes.push(map_err!(volume)?);
    }
    Ok(volumes)
}

#[tauri::command]
pub fn volume_update(_state: State<'_, crate::database::Database>, volume: Volume) -> Result<Volume, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE volumes
        SET title = ?1, order_index = ?2, updated_at = ?3
        WHERE id = ?4
    "#;

    let params: [&dyn rusqlite::ToSql; 4] = [
        &volume.title,
        &volume.order_index,
        &now,
        &volume.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Volume { updated_at: now, ..volume })
}

#[tauri::command]
pub fn volume_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    // 删除卷时，将该卷下的章节的 volume_id 设为 null
    let sql = "UPDATE chapters SET volume_id = NULL WHERE volume_id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;

    let sql = "DELETE FROM volumes WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 人物操作 ============

#[tauri::command]
pub fn character_create(_state: State<'_, crate::database::Database>, character: Character) -> Result<Character, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let character = Character {
        created_at: now,
        updated_at: now,
        ..character
    };

    let sql = r#"
        INSERT INTO characters (id, name, gender, age, appearance, personality, background, novel_id, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    "#;

    let params: [&dyn rusqlite::ToSql; 10] = [
        &character.id,
        &character.name,
        &character.gender.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.age.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.appearance.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.personality.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.background.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.created_at,
        &character.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(character)
}

#[tauri::command]
pub fn character_get_all(_state: State<'_, crate::database::Database>, novel_id: Option<String>) -> Result<Vec<Character>, String> {
    let conn = DB.get_connection();
    let mut characters = Vec::new();

    let sql = match &novel_id {
        Some(id) => {
            "SELECT id, name, gender, age, appearance, personality, background, novel_id, created_at, updated_at FROM characters WHERE novel_id = ?1 ORDER BY name"
        }
        None => {
            "SELECT id, name, gender, age, appearance, personality, background, novel_id, created_at, updated_at FROM characters ORDER BY name"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;

    let mut rows = match novel_id {
        Some(id) => map_err!(stmt.query([&id]))?,
        None => map_err!(stmt.query([]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                characters.push(Character {
                    id: map_err!(row.get(0))?,
                    name: map_err!(row.get(1))?,
                    gender: map_err!(row.get(2))?,
                    age: map_err!(row.get(3))?,
                    appearance: map_err!(row.get(4))?,
                    personality: map_err!(row.get(5))?,
                    background: map_err!(row.get(6))?,
                    novel_id: map_err!(row.get(7))?,
                    created_at: map_err!(row.get(8))?,
                    updated_at: map_err!(row.get(9))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(characters)
}

#[tauri::command]
pub fn character_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Character>, String> {
    let sql = "SELECT id, name, gender, age, appearance, personality, background, novel_id, created_at, updated_at FROM characters WHERE id = ?1";
    let conn = DB.get_connection();
    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Character {
            id: row.get(0)?,
            name: row.get(1)?,
            gender: row.get(2)?,
            age: row.get(3)?,
            appearance: row.get(4)?,
            personality: row.get(5)?,
            background: row.get(6)?,
            novel_id: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })) {
        Ok(character) => Ok(Some(character)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn character_update(_state: State<'_, crate::database::Database>, character: Character) -> Result<Character, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE characters
        SET name = ?1, gender = ?2, age = ?3, appearance = ?4,
            personality = ?5, background = ?6, novel_id = ?7, updated_at = ?8
        WHERE id = ?9
    "#;

    let params: [&dyn rusqlite::ToSql; 9] = [
        &character.name,
        &character.gender.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.age.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.appearance.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.personality.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.background.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &character.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &now,
        &character.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Character { updated_at: now, ..character })
}

#[tauri::command]
pub fn character_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM characters WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 知识库操作 ============

#[tauri::command]
pub fn knowledge_create(_state: State<'_, crate::database::Database>, knowledge: Knowledge) -> Result<Knowledge, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let knowledge = Knowledge {
        created_at: now,
        updated_at: now,
        ..knowledge
    };

    let sql = r#"
        INSERT INTO knowledge (id, title, category, content, tags, novel_id, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    "#;

    let params: [&dyn rusqlite::ToSql; 8] = [
        &knowledge.id,
        &knowledge.title,
        &knowledge.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.tags.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.created_at,
        &knowledge.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(knowledge)
}

#[tauri::command]
pub fn knowledge_get_all(_state: State<'_, crate::database::Database>, novel_id: Option<String>) -> Result<Vec<Knowledge>, String> {
    let conn = DB.get_connection();
    let mut knowledge_list = Vec::new();

    let sql = match &novel_id {
        Some(id) => {
            "SELECT id, title, category, content, tags, novel_id, created_at, updated_at FROM knowledge WHERE novel_id = ?1 ORDER BY updated_at DESC"
        }
        None => {
            "SELECT id, title, category, content, tags, novel_id, created_at, updated_at FROM knowledge ORDER BY updated_at DESC"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;

    let mut rows = match novel_id {
        Some(id) => map_err!(stmt.query([&id]))?,
        None => map_err!(stmt.query([]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                knowledge_list.push(Knowledge {
                    id: map_err!(row.get(0))?,
                    title: map_err!(row.get(1))?,
                    category: map_err!(row.get(2))?,
                    content: map_err!(row.get(3))?,
                    tags: map_err!(row.get(4))?,
                    novel_id: map_err!(row.get(5))?,
                    created_at: map_err!(row.get(6))?,
                    updated_at: map_err!(row.get(7))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(knowledge_list)
}

#[tauri::command]
pub fn knowledge_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Knowledge>, String> {
    let sql = "SELECT id, title, category, content, tags, novel_id, created_at, updated_at FROM knowledge WHERE id = ?1";
    let conn = DB.get_connection();
    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Knowledge {
            id: row.get(0)?,
            title: row.get(1)?,
            category: row.get(2)?,
            content: row.get(3)?,
            tags: row.get(4)?,
            novel_id: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })) {
        Ok(knowledge) => Ok(Some(knowledge)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn knowledge_update(_state: State<'_, crate::database::Database>, knowledge: Knowledge) -> Result<Knowledge, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE knowledge
        SET title = ?1, category = ?2, content = ?3, tags = ?4, novel_id = ?5, updated_at = ?6
        WHERE id = ?7
    "#;

    let params: [&dyn rusqlite::ToSql; 7] = [
        &knowledge.title,
        &knowledge.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.tags.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &knowledge.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &now,
        &knowledge.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Knowledge { updated_at: now, ..knowledge })
}

#[tauri::command]
pub fn knowledge_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM knowledge WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn knowledge_search(
    _state: State<'_, crate::database::Database>,
    query: String,
    novel_id: Option<String>,
) -> Result<Vec<Knowledge>, String> {
    let conn = DB.get_connection();
    let mut knowledge_list = Vec::new();

    let sql = match &novel_id {
        Some(_) => {
            "SELECT id, title, category, content, tags, novel_id, created_at, updated_at
             FROM knowledge
             WHERE novel_id = ?1
               AND (title LIKE ?2 OR content LIKE ?2 OR tags LIKE ?2)
             ORDER BY updated_at DESC"
        }
        None => {
            "SELECT id, title, category, content, tags, novel_id, created_at, updated_at
             FROM knowledge
             WHERE title LIKE ?1 OR content LIKE ?1 OR tags LIKE ?1
             ORDER BY updated_at DESC"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;

    let search_pattern = format!("%{}%", query);
    let mut rows = match novel_id {
        Some(id) => map_err!(stmt.query([&id, &search_pattern]))?,
        None => map_err!(stmt.query([&search_pattern]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                knowledge_list.push(Knowledge {
                    id: map_err!(row.get(0))?,
                    title: map_err!(row.get(1))?,
                    category: map_err!(row.get(2))?,
                    content: map_err!(row.get(3))?,
                    tags: map_err!(row.get(4))?,
                    novel_id: map_err!(row.get(5))?,
                    created_at: map_err!(row.get(6))?,
                    updated_at: map_err!(row.get(7))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(knowledge_list)
}

// ============ 词条操作 ============

#[tauri::command]
pub fn entry_create(_state: State<'_, crate::database::Database>, entry: Entry) -> Result<Entry, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let entry = Entry {
        created_at: now,
        updated_at: now,
        ..entry
    };

    let sql = r#"
        INSERT INTO entries (id, name, category, description, novel_id, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    "#;

    let params: [&dyn rusqlite::ToSql; 7] = [
        &entry.id,
        &entry.name,
        &entry.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &entry.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &entry.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &entry.created_at,
        &entry.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(entry)
}

#[tauri::command]
pub fn entry_get_all(_state: State<'_, crate::database::Database>, novel_id: Option<String>) -> Result<Vec<Entry>, String> {
    let conn = DB.get_connection();
    let mut entries = Vec::new();

    let sql = match &novel_id {
        Some(id) => {
            "SELECT id, name, category, description, novel_id, created_at, updated_at FROM entries WHERE novel_id = ?1 ORDER BY name"
        }
        None => {
            "SELECT id, name, category, description, novel_id, created_at, updated_at FROM entries ORDER BY name"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;

    let mut rows = match novel_id {
        Some(id) => map_err!(stmt.query([&id]))?,
        None => map_err!(stmt.query([]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                entries.push(Entry {
                    id: map_err!(row.get(0))?,
                    name: map_err!(row.get(1))?,
                    category: map_err!(row.get(2))?,
                    description: map_err!(row.get(3))?,
                    novel_id: map_err!(row.get(4))?,
                    created_at: map_err!(row.get(5))?,
                    updated_at: map_err!(row.get(6))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(entries)
}

#[tauri::command]
pub fn entry_update(_state: State<'_, crate::database::Database>, entry: Entry) -> Result<Entry, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE entries
        SET name = ?1, category = ?2, description = ?3, novel_id = ?4, updated_at = ?5
        WHERE id = ?6
    "#;

    let params: [&dyn rusqlite::ToSql; 6] = [
        &entry.name,
        &entry.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &entry.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &entry.novel_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &now,
        &entry.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Entry { updated_at: now, ..entry })
}

#[tauri::command]
pub fn entry_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM entries WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 剧情卡片操作 ============

#[tauri::command]
pub fn plot_card_create(_state: State<'_, crate::database::Database>, plot_card: PlotCard) -> Result<PlotCard, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let plot_card = PlotCard {
        created_at: now,
        updated_at: now,
        ..plot_card
    };

    let sql = r#"
        INSERT INTO plot_cards (id, novel_id, description, mood, importance, goal, order_index, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
    "#;

    let params: [&dyn rusqlite::ToSql; 9] = [
        &plot_card.id,
        &plot_card.novel_id,
        &plot_card.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.mood.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.importance.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.goal.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.order_index,
        &plot_card.created_at,
        &plot_card.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(plot_card)
}

#[tauri::command]
pub fn plot_card_get_by_novel(_state: State<'_, crate::database::Database>, novel_id: String) -> Result<Vec<PlotCard>, String> {
    let sql = "SELECT id, novel_id, description, mood, importance, goal, order_index, created_at, updated_at FROM plot_cards WHERE novel_id = ?1 ORDER BY order_index ASC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let plot_card_iter = map_err!(stmt.query_map([&novel_id], |row| {
        Ok(PlotCard {
            id: row.get(0)?,
            novel_id: row.get(1)?,
            description: row.get(2)?,
            mood: row.get(3)?,
            importance: row.get(4)?,
            goal: row.get(5)?,
            order_index: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }))?;

    let mut plot_cards = Vec::new();
    for plot_card in plot_card_iter {
        plot_cards.push(map_err!(plot_card)?);
    }
    Ok(plot_cards)
}

#[tauri::command]
pub fn plot_card_update(_state: State<'_, crate::database::Database>, plot_card: PlotCard) -> Result<PlotCard, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE plot_cards
        SET novel_id = ?1, description = ?2, mood = ?3, importance = ?4, goal = ?5, order_index = ?6, updated_at = ?7
        WHERE id = ?8
    "#;

    let params: [&dyn rusqlite::ToSql; 8] = [
        &plot_card.novel_id,
        &plot_card.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.mood.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.importance.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.goal.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &plot_card.order_index,
        &now,
        &plot_card.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(PlotCard { updated_at: now, ..plot_card })
}

#[tauri::command]
pub fn plot_card_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM plot_cards WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlotCardReorderRequest {
    pub novel_id: String,
    pub card_ids: Vec<String>,
}

#[tauri::command]
pub fn plot_card_reorder(_state: State<'_, crate::database::Database>, request: PlotCardReorderRequest) -> Result<Vec<PlotCard>, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let conn = DB.get_connection();

    for (index, card_id) in request.card_ids.iter().enumerate() {
        let sql = "UPDATE plot_cards SET order_index = ?1, updated_at = ?2 WHERE id = ?3";
        let params: [&dyn rusqlite::ToSql; 3] = [
            &(index as i64),
            &now,
            card_id,
        ];
        conn.execute(sql, &params).map_err(|e| e.to_string())?;
    }

    // Return updated plot cards
    let sql = "SELECT id, novel_id, description, mood, importance, goal, order_index, created_at, updated_at FROM plot_cards WHERE novel_id = ?1 ORDER BY order_index ASC";
    let mut stmt = map_err!(conn.prepare(sql))?;
    let plot_card_iter = map_err!(stmt.query_map([&request.novel_id], |row| {
        Ok(PlotCard {
            id: row.get(0)?,
            novel_id: row.get(1)?,
            description: row.get(2)?,
            mood: row.get(3)?,
            importance: row.get(4)?,
            goal: row.get(5)?,
            order_index: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }))?;

    let mut plot_cards = Vec::new();
    for plot_card in plot_card_iter {
        plot_cards.push(map_err!(plot_card)?);
    }
    Ok(plot_cards)
}

// ============ 书籍操作 ============

#[tauri::command]
pub fn book_create(_state: State<'_, crate::database::Database>, book: Book) -> Result<Book, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let book = Book {
        created_at: now,
        updated_at: now,
        last_read_at: Some(now),
        ..book
    };

    let sql = r#"
        INSERT INTO books (id, title, author, cover_image, file_path, file_type, category_id, description, total_chapters, current_chapter, current_position, word_count, is_pinned, created_at, updated_at, last_read_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
    "#;

    let params: [&dyn rusqlite::ToSql; 16] = [
        &book.id,
        &book.title,
        &book.author.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.cover_image.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.file_path.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.file_type.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.category_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.total_chapters,
        &book.current_chapter,
        &book.current_position,
        &book.word_count,
        &book.is_pinned,
        &book.created_at,
        &book.updated_at,
        &book.last_read_at.unwrap_or(0),
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(book)
}

#[tauri::command]
pub fn book_get_all(_state: State<'_, crate::database::Database>) -> Result<Vec<Book>, String> {
    let sql = "SELECT id, title, author, cover_image, file_path, file_type, category_id, description, total_chapters, current_chapter, current_position, word_count, is_pinned, created_at, updated_at, last_read_at FROM books ORDER BY is_pinned DESC, last_read_at DESC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let book_iter = map_err!(stmt.query_map([], |row| {
        Ok(Book {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2)?,
            cover_image: row.get(3)?,
            file_path: row.get(4)?,
            file_type: row.get(5)?,
            category_id: row.get(6)?,
            description: row.get(7)?,
            total_chapters: row.get(8)?,
            current_chapter: row.get(9)?,
            current_position: row.get(10)?,
            word_count: row.get(11)?,
            is_pinned: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
            last_read_at: row.get(15)?,
        })
    }))?;

    let mut books = Vec::new();
    for book in book_iter {
        books.push(map_err!(book)?);
    }
    Ok(books)
}

#[tauri::command]
pub fn book_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Book>, String> {
    let sql = "SELECT id, title, author, cover_image, file_path, file_type, category_id, description, total_chapters, current_chapter, current_position, word_count, is_pinned, created_at, updated_at, last_read_at FROM books WHERE id = ?1";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Book {
            id: row.get(0)?,
            title: row.get(1)?,
            author: row.get(2)?,
            cover_image: row.get(3)?,
            file_path: row.get(4)?,
            file_type: row.get(5)?,
            category_id: row.get(6)?,
            description: row.get(7)?,
            total_chapters: row.get(8)?,
            current_chapter: row.get(9)?,
            current_position: row.get(10)?,
            word_count: row.get(11)?,
            is_pinned: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
            last_read_at: row.get(15)?,
        })
    })) {
        Ok(book) => Ok(Some(book)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn book_update(_state: State<'_, crate::database::Database>, book: Book) -> Result<Book, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE books
        SET title = ?1, author = ?2, cover_image = ?3, file_path = ?4, file_type = ?5, category_id = ?6, description = ?7, total_chapters = ?8, current_chapter = ?9, current_position = ?10, word_count = ?11, is_pinned = ?12, updated_at = ?13, last_read_at = ?14
        WHERE id = ?15
    "#;

    let params: [&dyn rusqlite::ToSql; 15] = [
        &book.title,
        &book.author.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.cover_image.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.file_path.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.file_type.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.category_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.description.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &book.total_chapters,
        &book.current_chapter,
        &book.current_position,
        &book.word_count,
        &book.is_pinned,
        &now,
        &book.last_read_at.unwrap_or(0),
        &book.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Book { updated_at: now, ..book })
}

#[tauri::command]
pub fn book_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM books WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn book_search(_state: State<'_, crate::database::Database>, query: String, category_id: Option<String>) -> Result<Vec<Book>, String> {
    let conn = DB.get_connection();
    let mut books = Vec::new();

    let sql = match &category_id {
        Some(_) => {
            "SELECT id, title, author, cover_image, file_path, file_type, category_id, description, total_chapters, current_chapter, current_position, word_count, is_pinned, created_at, updated_at, last_read_at FROM books WHERE category_id = ?1 AND (title LIKE ?2 OR author LIKE ?2) ORDER BY is_pinned DESC, last_read_at DESC"
        }
        None => {
            "SELECT id, title, author, cover_image, file_path, file_type, category_id, description, total_chapters, current_chapter, current_position, word_count, is_pinned, created_at, updated_at, last_read_at FROM books WHERE title LIKE ?1 OR author LIKE ?1 ORDER BY is_pinned DESC, last_read_at DESC"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;
    let search_pattern = format!("%{}%", query);

    let mut rows = match category_id {
        Some(id) => map_err!(stmt.query([&id, &search_pattern]))?,
        None => map_err!(stmt.query([&search_pattern]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                books.push(Book {
                    id: map_err!(row.get(0))?,
                    title: map_err!(row.get(1))?,
                    author: map_err!(row.get(2))?,
                    cover_image: map_err!(row.get(3))?,
                    file_path: map_err!(row.get(4))?,
                    file_type: map_err!(row.get(5))?,
                    category_id: map_err!(row.get(6))?,
                    description: map_err!(row.get(7))?,
                    total_chapters: map_err!(row.get(8))?,
                    current_chapter: map_err!(row.get(9))?,
                    current_position: map_err!(row.get(10))?,
                    word_count: map_err!(row.get(11))?,
                    is_pinned: map_err!(row.get(12))?,
                    created_at: map_err!(row.get(13))?,
                    updated_at: map_err!(row.get(14))?,
                    last_read_at: map_err!(row.get(15))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(books)
}

#[tauri::command]
pub fn book_update_reading_progress(_state: State<'_, crate::database::Database>, id: String, current_chapter: i64, current_position: i64) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = "UPDATE books SET current_chapter = ?1, current_position = ?2, last_read_at = ?3, updated_at = ?4 WHERE id = ?5";

    let params: [&dyn rusqlite::ToSql; 5] = [
        &current_chapter,
        &current_position,
        &now,
        &now,
        &id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 书籍章节操作 ============

#[tauri::command]
pub fn book_chapter_create(_state: State<'_, crate::database::Database>, chapter: BookChapter) -> Result<BookChapter, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let chapter = BookChapter {
        created_at: now,
        updated_at: now,
        ..chapter
    };

    let sql = r#"
        INSERT INTO book_chapters (id, book_id, title, content, order_index, word_count, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    "#;

    let params: [&dyn rusqlite::ToSql; 8] = [
        &chapter.id,
        &chapter.book_id,
        &chapter.title,
        &chapter.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.order_index,
        &chapter.word_count,
        &chapter.created_at,
        &chapter.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(chapter)
}

#[tauri::command]
pub fn book_chapters_get_by_book(_state: State<'_, crate::database::Database>, book_id: String) -> Result<Vec<BookChapter>, String> {
    let sql = "SELECT id, book_id, title, content, order_index, word_count, created_at, updated_at FROM book_chapters WHERE book_id = ?1 ORDER BY order_index ASC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let chapter_iter = map_err!(stmt.query_map([&book_id], |row| {
        Ok(BookChapter {
            id: row.get(0)?,
            book_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            order_index: row.get(4)?,
            word_count: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }))?;

    let mut chapters = Vec::new();
    for chapter in chapter_iter {
        chapters.push(map_err!(chapter)?);
    }
    Ok(chapters)
}

#[tauri::command]
pub fn book_chapter_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<BookChapter>, String> {
    let sql = "SELECT id, book_id, title, content, order_index, word_count, created_at, updated_at FROM book_chapters WHERE id = ?1";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(BookChapter {
            id: row.get(0)?,
            book_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            order_index: row.get(4)?,
            word_count: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })) {
        Ok(chapter) => Ok(Some(chapter)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn book_chapter_update(_state: State<'_, crate::database::Database>, chapter: BookChapter) -> Result<BookChapter, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE book_chapters
        SET title = ?1, content = ?2, order_index = ?3, word_count = ?4, updated_at = ?5
        WHERE id = ?6
    "#;

    let params: [&dyn rusqlite::ToSql; 6] = [
        &chapter.title,
        &chapter.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &chapter.order_index,
        &chapter.word_count,
        &now,
        &chapter.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(BookChapter { updated_at: now, ..chapter })
}

#[tauri::command]
pub fn book_chapter_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM book_chapters WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 书籍分类操作 ============

#[tauri::command]
pub fn book_category_create(_state: State<'_, crate::database::Database>, category: BookCategory) -> Result<BookCategory, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let category = BookCategory {
        created_at: now,
        updated_at: now,
        ..category
    };

    let sql = r#"
        INSERT INTO book_categories (id, name, color, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
    "#;

    let params: [&dyn rusqlite::ToSql; 5] = [
        &category.id,
        &category.name,
        &category.color.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &category.created_at,
        &category.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(category)
}

#[tauri::command]
pub fn book_category_get_all(_state: State<'_, crate::database::Database>) -> Result<Vec<BookCategory>, String> {
    let sql = "SELECT id, name, color, created_at, updated_at FROM book_categories ORDER BY name";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let category_iter = map_err!(stmt.query_map([], |row| {
        Ok(BookCategory {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }))?;

    let mut categories = Vec::new();
    for category in category_iter {
        categories.push(map_err!(category)?);
    }
    Ok(categories)
}

#[tauri::command]
pub fn book_category_update(_state: State<'_, crate::database::Database>, category: BookCategory) -> Result<BookCategory, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = "UPDATE book_categories SET name = ?1, color = ?2, updated_at = ?3 WHERE id = ?4";

    let params: [&dyn rusqlite::ToSql; 4] = [
        &category.name,
        &category.color.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &now,
        &category.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(BookCategory { updated_at: now, ..category })
}

#[tauri::command]
pub fn book_category_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM book_categories WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 书签操作 ============

#[tauri::command]
pub fn book_bookmark_create(_state: State<'_, crate::database::Database>, bookmark: BookBookmark) -> Result<BookBookmark, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let bookmark = BookBookmark {
        created_at: now,
        ..bookmark
    };

    let sql = r#"
        INSERT INTO book_bookmarks (id, book_id, chapter_id, position, title, note, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    "#;

    let params: [&dyn rusqlite::ToSql; 7] = [
        &bookmark.id,
        &bookmark.book_id,
        &bookmark.chapter_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &bookmark.position,
        &bookmark.title.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &bookmark.note.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &bookmark.created_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(bookmark)
}

#[tauri::command]
pub fn book_bookmarks_get_by_book(_state: State<'_, crate::database::Database>, book_id: String) -> Result<Vec<BookBookmark>, String> {
    let sql = "SELECT id, book_id, chapter_id, position, title, note, created_at FROM book_bookmarks WHERE book_id = ?1 ORDER BY created_at DESC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let bookmark_iter = map_err!(stmt.query_map([&book_id], |row| {
        Ok(BookBookmark {
            id: row.get(0)?,
            book_id: row.get(1)?,
            chapter_id: row.get(2)?,
            position: row.get(3)?,
            title: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
        })
    }))?;

    let mut bookmarks = Vec::new();
    for bookmark in bookmark_iter {
        bookmarks.push(map_err!(bookmark)?);
    }
    Ok(bookmarks)
}

#[tauri::command]
pub fn book_bookmark_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM book_bookmarks WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 书籍笔记操作 ============

#[tauri::command]
pub fn book_note_create(_state: State<'_, crate::database::Database>, note: BookNote) -> Result<BookNote, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let note = BookNote {
        created_at: now,
        updated_at: now,
        ..note
    };

    let sql = r#"
        INSERT INTO book_notes (id, book_id, chapter_id, content, highlighted_text, page_position, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    "#;

    let params: [&dyn rusqlite::ToSql; 8] = [
        &note.id,
        &note.book_id,
        &note.chapter_id.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &note.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &note.highlighted_text.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &note.page_position,
        &note.created_at,
        &note.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn book_notes_get_by_book(_state: State<'_, crate::database::Database>, book_id: String) -> Result<Vec<BookNote>, String> {
    let sql = "SELECT id, book_id, chapter_id, content, highlighted_text, page_position, created_at, updated_at FROM book_notes WHERE book_id = ?1 ORDER BY created_at DESC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let note_iter = map_err!(stmt.query_map([&book_id], |row| {
        Ok(BookNote {
            id: row.get(0)?,
            book_id: row.get(1)?,
            chapter_id: row.get(2)?,
            content: row.get(3)?,
            highlighted_text: row.get(4)?,
            page_position: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    }))?;

    let mut notes = Vec::new();
    for note in note_iter {
        notes.push(map_err!(note)?);
    }
    Ok(notes)
}

#[tauri::command]
pub fn book_note_update(_state: State<'_, crate::database::Database>, note: BookNote) -> Result<BookNote, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE book_notes
        SET content = ?1, highlighted_text = ?2, page_position = ?3, updated_at = ?4
        WHERE id = ?5
    "#;

    let params: [&dyn rusqlite::ToSql; 5] = [
        &note.content.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &note.highlighted_text.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &note.page_position,
        &now,
        &note.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(BookNote { updated_at: now, ..note })
}

#[tauri::command]
pub fn book_note_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM book_notes WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

// ============ 书籍设置操作 ============

#[tauri::command]
pub fn book_settings_get(_state: State<'_, crate::database::Database>) -> Result<BookSettings, String> {
    let sql = "SELECT id, font_size, line_height, theme, font_family, created_at, updated_at FROM book_settings WHERE id = 'default'";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([], |row| {
        Ok(BookSettings {
            id: row.get(0)?,
            font_size: row.get(1)?,
            line_height: row.get(2)?,
            theme: row.get(3)?,
            font_family: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })) {
        Ok(settings) => Ok(settings),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => {
            let now = chrono::Utc::now().timestamp_millis();
            let default_settings = BookSettings {
                id: "default".to_string(),
                font_size: 18,
                line_height: 1.8,
                theme: Some("sepia".to_string()),
                font_family: Some("system-ui".to_string()),
                created_at: now,
                updated_at: now,
            };

            let sql = r#"
                INSERT INTO book_settings (id, font_size, line_height, theme, font_family, created_at, updated_at)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#;

            let params: [&dyn rusqlite::ToSql; 7] = [
                &default_settings.id,
                &default_settings.font_size,
                &default_settings.line_height,
                &default_settings.theme.as_ref().map(|s| s.as_str()).unwrap_or(""),
                &default_settings.font_family.as_ref().map(|s| s.as_str()).unwrap_or(""),
                &default_settings.created_at,
                &default_settings.updated_at,
            ];

            DB.execute(sql, &params).map_err(|e| e.to_string())?;
            Ok(default_settings)
        }
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn book_settings_update(_state: State<'_, crate::database::Database>, settings: BookSettings) -> Result<BookSettings, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE book_settings
        SET font_size = ?1, line_height = ?2, theme = ?3, font_family = ?4, updated_at = ?5
        WHERE id = ?6
    "#;

    let params: [&dyn rusqlite::ToSql; 6] = [
        &settings.font_size,
        &settings.line_height,
        &settings.theme.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &settings.font_family.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &now,
        &settings.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(BookSettings { updated_at: now, ..settings })
}

// ============ 文件读取命令 ============

#[tauri::command]
pub fn read_text_file(_state: State<'_, crate::database::Database>, path: String) -> Result<String, String> {
    use std::fs;

    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

// ============ 提示词类型定义 ============

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub content: String,
    pub category: Option<String>,
    pub tags: Option<String>,
    pub is_favorite: i32,
    pub usage_count: i64,
    pub is_featured: i32,
    pub is_builtin: i32,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============ 提示词操作 ============

#[tauri::command]
pub fn prompt_create(_state: State<'_, crate::database::Database>, prompt: Prompt) -> Result<Prompt, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let prompt = Prompt {
        created_at: now,
        updated_at: now,
        ..prompt
    };

    let sql = r#"
        INSERT INTO prompts (id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
    "#;

    let params: [&dyn rusqlite::ToSql; 11] = [
        &prompt.id,
        &prompt.title,
        &prompt.content,
        &prompt.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &prompt.tags.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &prompt.is_favorite,
        &prompt.usage_count,
        &prompt.is_featured,
        &prompt.is_builtin,
        &prompt.created_at,
        &prompt.updated_at,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(prompt)
}

#[tauri::command]
pub fn prompt_get_all(_state: State<'_, crate::database::Database>, category: Option<String>, sort_by: Option<String>) -> Result<Vec<Prompt>, String> {
    let conn = DB.get_connection();
    let mut prompts = Vec::new();

    let sql = match (&category, &sort_by) {
        (Some(cat), Some(sort)) => {
            match sort.as_str() {
                "popular" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 ORDER BY usage_count DESC, updated_at DESC"
                }
                "new" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 ORDER BY created_at DESC"
                }
                "featured" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 AND is_featured = 1 ORDER BY usage_count DESC"
                }
                "mine" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 AND is_builtin = 0 ORDER BY created_at DESC"
                }
                _ => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 ORDER BY usage_count DESC"
                }
            }
        }
        (Some(cat), None) => {
            "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE category = ?1 ORDER BY usage_count DESC"
        }
        (None, Some(sort)) => {
            match sort.as_str() {
                "popular" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts ORDER BY usage_count DESC, updated_at DESC"
                }
                "new" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts ORDER BY created_at DESC"
                }
                "featured" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE is_featured = 1 ORDER BY usage_count DESC"
                }
                "mine" => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE is_builtin = 0 ORDER BY created_at DESC"
                }
                _ => {
                    "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts ORDER BY usage_count DESC"
                }
            }
        }
        (None, None) => {
            "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts ORDER BY usage_count DESC, updated_at DESC"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;

    let mut rows = match &category {
        Some(cat) => map_err!(stmt.query([cat]))?,
        None => map_err!(stmt.query([]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                prompts.push(Prompt {
                    id: map_err!(row.get(0))?,
                    title: map_err!(row.get(1))?,
                    content: map_err!(row.get(2))?,
                    category: map_err!(row.get(3))?,
                    tags: map_err!(row.get(4))?,
                    is_favorite: map_err!(row.get(5))?,
                    usage_count: map_err!(row.get(6))?,
                    is_featured: map_err!(row.get(7))?,
                    is_builtin: map_err!(row.get(8))?,
                    created_at: map_err!(row.get(9))?,
                    updated_at: map_err!(row.get(10))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(prompts)
}

#[tauri::command]
pub fn prompt_get_by_id(_state: State<'_, crate::database::Database>, id: String) -> Result<Option<Prompt>, String> {
    let sql = "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE id = ?1";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    match map_err!(stmt.query_row([&id], |row| {
        Ok(Prompt {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            category: row.get(3)?,
            tags: row.get(4)?,
            is_favorite: row.get(5)?,
            usage_count: row.get(6)?,
            is_featured: row.get(7)?,
            is_builtin: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })) {
        Ok(prompt) => Ok(Some(prompt)),
        Err(e) if e.contains("QueryReturnedNoRows") || e.contains("no rows") => Ok(None),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn prompt_update(_state: State<'_, crate::database::Database>, prompt: Prompt) -> Result<Prompt, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let sql = r#"
        UPDATE prompts
        SET title = ?1, content = ?2, category = ?3, tags = ?4, is_featured = ?5, updated_at = ?6
        WHERE id = ?7
    "#;

    let params: [&dyn rusqlite::ToSql; 7] = [
        &prompt.title,
        &prompt.content,
        &prompt.category.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &prompt.tags.as_ref().map(|s| s.as_str()).unwrap_or(""),
        &prompt.is_featured,
        &now,
        &prompt.id,
    ];

    DB.execute(sql, &params).map_err(|e| e.to_string())?;
    Ok(Prompt { updated_at: now, ..prompt })
}

#[tauri::command]
pub fn prompt_delete(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "DELETE FROM prompts WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn prompt_increment_usage(_state: State<'_, crate::database::Database>, id: String) -> Result<(), String> {
    let sql = "UPDATE prompts SET usage_count = usage_count + 1 WHERE id = ?1";
    DB.execute(sql, &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn prompt_toggle_favorite(_state: State<'_, crate::database::Database>, id: String) -> Result<bool, String> {
    let conn = DB.get_connection();

    let check_sql = "SELECT is_favorite FROM prompts WHERE id = ?1";
    let mut stmt = map_err!(conn.prepare(check_sql))?;
    let is_favorite: i32 = map_err!(stmt.query_row([&id], |row| row.get(0)))?;

    let new_favorite = if is_favorite == 1 { 0 } else { 1 };
    let sql = "UPDATE prompts SET is_favorite = ?1 WHERE id = ?2";
    DB.execute(sql, &[&new_favorite, &id]).map_err(|e| e.to_string())?;

    Ok(new_favorite == 1)
}

#[tauri::command]
pub fn prompt_get_favorites(_state: State<'_, crate::database::Database>) -> Result<Vec<Prompt>, String> {
    let sql = "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at FROM prompts WHERE is_favorite = 1 ORDER BY updated_at DESC";
    let conn = DB.get_connection();

    let mut stmt = map_err!(conn.prepare(sql))?;
    let prompt_iter = map_err!(stmt.query_map([], |row| {
        Ok(Prompt {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            category: row.get(3)?,
            tags: row.get(4)?,
            is_favorite: row.get(5)?,
            usage_count: row.get(6)?,
            is_featured: row.get(7)?,
            is_builtin: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }))?;

    let mut prompts = Vec::new();
    for prompt in prompt_iter {
        prompts.push(map_err!(prompt)?);
    }
    Ok(prompts)
}

#[tauri::command]
pub fn prompt_search(_state: State<'_, crate::database::Database>, keyword: String, category: Option<String>) -> Result<Vec<Prompt>, String> {
    let conn = DB.get_connection();
    let mut prompts = Vec::new();

    let sql = match &category {
        Some(_) => {
            "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at
             FROM prompts
             WHERE category = ?1 AND (title LIKE ?2 OR content LIKE ?2 OR tags LIKE ?2)
             ORDER BY usage_count DESC"
        }
        None => {
            "SELECT id, title, content, category, tags, is_favorite, usage_count, is_featured, is_builtin, created_at, updated_at
             FROM prompts
             WHERE title LIKE ?1 OR content LIKE ?1 OR tags LIKE ?1
             ORDER BY usage_count DESC"
        }
    };

    let mut stmt = map_err!(conn.prepare(sql))?;
    let search_pattern = format!("%{}%", keyword);

    let mut rows = match category {
        Some(cat) => map_err!(stmt.query([&cat, &search_pattern]))?,
        None => map_err!(stmt.query([&search_pattern]))?,
    };

    loop {
        match rows.next() {
            Ok(Some(row)) => {
                prompts.push(Prompt {
                    id: map_err!(row.get(0))?,
                    title: map_err!(row.get(1))?,
                    content: map_err!(row.get(2))?,
                    category: map_err!(row.get(3))?,
                    tags: map_err!(row.get(4))?,
                    is_favorite: map_err!(row.get(5))?,
                    usage_count: map_err!(row.get(6))?,
                    is_featured: map_err!(row.get(7))?,
                    is_builtin: map_err!(row.get(8))?,
                    created_at: map_err!(row.get(9))?,
                    updated_at: map_err!(row.get(10))?,
                });
            }
            Ok(None) => break,
            Err(e) => return Err(e.to_string()),
        }
    }

    Ok(prompts)
}
