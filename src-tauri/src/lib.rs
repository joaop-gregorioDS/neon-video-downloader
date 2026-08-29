use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

#[tauri::command]
async fn download_video(app: AppHandle, url: String, destination: String, media_type: String) -> Result<(), String> {
    let sidecar_command = app
        .shell()
        .sidecar("yt-dlp")
        .map_err(|e| format!("Erro ao inicializar o sidecar yt-dlp: {}", e))?;

    let mut args = vec![
        "--newline".to_string(),
        "--progress".to_string(),
    ];

    if media_type == "mp3" {
        args.extend(vec![
            "-f".to_string(),
            "bestaudio/best".to_string(),
            "--extract-audio".to_string(),
            "--audio-format".to_string(),
            "mp3".to_string(),
            "--audio-quality".to_string(),
            "0".to_string(), // 0 is best
            "-o".to_string(),
            format!("{}/%(title)s.%(ext)s", destination),
            url.clone(),
        ]);
    } else {
        args.extend(vec![
            "--format".to_string(),
            "bestvideo+bestaudio/best".to_string(),
            "--merge-output-format".to_string(),
            "mp4".to_string(),
            "-o".to_string(),
            format!("{}/%(title)s.%(ext)s", destination),
            url.clone(),
        ]);
    }

    let (mut rx, mut _child) = sidecar_command
        .args(args)
        .spawn()
        .map_err(|e| format!("Erro ao iniciar download: {}", e))?;

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line_str = String::from_utf8_lossy(&line);
                    app.emit("download-progress", line_str.to_string()).unwrap();
                }
                CommandEvent::Stderr(line) => {
                    let line_str = String::from_utf8_lossy(&line);
                    app.emit("download-progress", format!("[AVISO]: {}", line_str))
                        .unwrap();
                }
                CommandEvent::Terminated(payload) => {
                    let status = if payload.code == Some(0) {
                        "SUCCESS"
                    } else {
                        "ERROR"
                    };
                    app.emit("download-finished", status).unwrap();
                }
                _ => {}
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
