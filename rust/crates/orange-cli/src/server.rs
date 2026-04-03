use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};
use serde_json::{Value, json};

pub fn run_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let runtime = tokio::runtime::Runtime::new()?;
    runtime.block_on(async {
        let ws_route = warp::path("ws")
            .and(warp::ws())
            .map(|ws: warp::ws::Ws| {
                ws.on_upgrade(handle_connection)
            });

        println!("Starting WebSocket server on ws://127.0.0.1:{}", port);
        warp::serve(ws_route).run(([127, 0, 0, 1], port)).await;
    });
    Ok(())
}

async fn handle_connection(ws: WebSocket) {
    let (mut tx, mut rx) = ws.split();

    while let Some(result) = rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        };

        if msg.is_text() {
            let text = msg.to_str().unwrap();
            // 解析 JSON-RPC 请求
            if let Ok(req) = serde_json::from_str::<Value>(text) {
                // 模拟处理流式响应
                let id = req.get("id").cloned().unwrap_or(json!(null));
                
                // 发送开始信号
                let _ = tx.send(Message::text(json!({
                    "jsonrpc": "2.0",
                    "method": "stream_start",
                    "id": id.clone()
                }).to_string())).await;

                // 模拟 Token 流
                for word in ["Hello", " from", " Rust", " Server!"] {
                    tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                    let _ = tx.send(Message::text(json!({
                        "jsonrpc": "2.0",
                        "method": "stream_token",
                        "params": { "token": word },
                        "id": id.clone()
                    }).to_string())).await;
                }

                // 发送结束信号
                let _ = tx.send(Message::text(json!({
                    "jsonrpc": "2.0",
                    "method": "stream_end",
                    "id": id
                }).to_string())).await;
            }
        }
    }
}
