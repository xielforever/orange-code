use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    method: String,
    params: Option<Value>,
    id: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    result: Option<Value>,
    error: Option<JsonRpcError>,
    id: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct JsonRpcError {
    code: i32,
    message: String,
    data: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct JsonRpcNotification {
    jsonrpc: String,
    method: String,
    params: Option<Value>,
    id: Option<Value>,
}

impl JsonRpcError {
    fn parse_error() -> Self {
        Self {
            code: -32700,
            message: "Parse error".to_string(),
            data: None,
        }
    }

    fn invalid_request() -> Self {
        Self {
            code: -32600,
            message: "Invalid Request".to_string(),
            data: None,
        }
    }

    fn method_not_found() -> Self {
        Self {
            code: -32601,
            message: "Method not found".to_string(),
            data: None,
        }
    }

    fn invalid_params(message: &str) -> Self {
        Self {
            code: -32602,
            message: message.to_string(),
            data: None,
        }
    }

    fn internal_error(message: &str) -> Self {
        Self {
            code: -32603,
            message: message.to_string(),
            data: None,
        }
    }

    fn session_not_found() -> Self {
        Self {
            code: -32001,
            message: "Session not found".to_string(),
            data: None,
        }
    }

    fn model_not_found() -> Self {
        Self {
            code: -32003,
            message: "Model not found".to_string(),
            data: None,
        }
    }
}

impl JsonRpcResponse {
    fn success(result: Value, id: Option<Value>) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            result: Some(result),
            error: None,
            id,
        }
    }

    fn error(error: JsonRpcError, id: Option<Value>) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            result: None,
            error: Some(error),
            id,
        }
    }
}

impl JsonRpcNotification {
    fn new(method: &str, params: Option<Value>, id: Option<Value>) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params,
            id,
        }
    }
}

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
            let text = match msg.to_str() {
                Ok(t) => t,
                Err(_) => continue,
            };

            if let Ok(req) = serde_json::from_str::<JsonRpcRequest>(text) {
                let id = req.id.clone();
                let method = req.method.as_str();
                let params = req.params;

                match method {
                    "get_models" => {
                        let models = vec![
                            json!({
                                "id": "claude-sonnet-4-6",
                                "name": "Claude Sonnet 4.6",
                                "provider": "anthropic"
                            }),
                            json!({
                                "id": "claude-opus-4-6",
                                "name": "Claude Opus 4.6",
                                "provider": "anthropic"
                            }),
                        ];
                        let response = JsonRpcResponse::success(
                            json!({ "models": models }),
                            id,
                        );
                        let _ = tx.send(Message::text(serde_json::to_string(&response).unwrap())).await;
                    }
                    "chat" => {
                        let message = params
                            .and_then(|p| p.get("message").cloned())
                            .and_then(|m| m.as_str().map(|s| s.to_string()))
                            .unwrap_or_else(|| "".to_string());
                        let message = message.as_str();
                        let request_id = id.clone().unwrap_or(json!(null));

                        if message.is_empty() {
                            let response = JsonRpcResponse::error(
                                JsonRpcError::invalid_params("message is required"),
                                id,
                            );
                            let _ = tx.send(Message::text(serde_json::to_string(&response).unwrap())).await;
                            continue;
                        }

                        let start_event = JsonRpcNotification::new(
                            "stream_start",
                            None,
                            Some(request_id.clone()),
                        );
                        let _ = tx.send(Message::text(serde_json::to_string(&start_event).unwrap())).await;

                        for word in ["Hello", " from", " Rust", " Server!"] {
                            tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                            let token_event = JsonRpcNotification::new(
                                "stream_token",
                                Some(json!({ "token": word })),
                                Some(request_id.clone()),
                            );
                            let _ = tx.send(Message::text(serde_json::to_string(&token_event).unwrap())).await;
                        }

                        let end_event = JsonRpcNotification::new(
                            "stream_end",
                            None,
                            Some(request_id),
                        );
                        let _ = tx.send(Message::text(serde_json::to_string(&end_event).unwrap())).await;
                    }
                    _ => {
                        let response = JsonRpcResponse::error(
                            JsonRpcError::method_not_found(),
                            id,
                        );
                        let _ = tx.send(Message::text(serde_json::to_string(&response).unwrap())).await;
                    }
                }
            } else {
                let response = JsonRpcResponse::error(
                    JsonRpcError::parse_error(),
                    None,
                );
                let _ = tx.send(Message::text(serde_json::to_string(&response).unwrap())).await;
            }
        }
    }
}
