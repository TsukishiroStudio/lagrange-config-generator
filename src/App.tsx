import {
  AppBar,
  Box,
  Button,
  createTheme,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography
} from "@mui/material";

import '@fontsource-variable/noto-sans-sc/index.css';
import "@fontsource-variable/jetbrains-mono/index.css";
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import {useImmer} from "use-immer";
import {useRef} from "react";

type LagrangeConfigBase = {
  Logging: {
    LogLevel: {
      Default: string;
    };
  };
  SignServerUrl: string;
  SignProxyUrl: string;
  MusicSignServerUrl: string;
  Account: {
    Uin: number;
    Password: string;
    Protocol: string;
    AutoReconnect: boolean;
    GetOptimumServer: boolean;
  };
  Message: {
    IgnoreSelf: boolean;
    StringPost: boolean;
  };
  QrCode: {
    ConsoleCompatibilityMode: boolean;
  };
}

type Implementation =
    | ReverseWebSocketImplementation
    | ForwardWebSocketImplementation
    | HttpPostImplementation
    | HttpImplementation;

type ReverseWebSocketImplementation = {
  Type: "ReverseWebSocket";
  Host: string;
  Port: number;
  Suffix: string;
  ReconnectInterval: number;
  HeartBeatInterval: number;
  AccessToken: string;
}

type ForwardWebSocketImplementation = {
  Type: "ForwardWebSocket";
  Host: string;
  Port: number;
  HeartBeatInterval: number;
  HeartBeatEnable: boolean;
  AccessToken: string;
}

type HttpPostImplementation = {
  Type: "HttpPost";
  Host: string;
  Port: number;
  Suffix: string;
  HeartBeatInterval: number;
  HeartBeatEnable: boolean;
  AccessToken: string;
  Secret: string;
}

type HttpImplementation = {
  Type: "Http";
  Host: string;
  Port: number;
  AccessToken: string;
}

const theme = createTheme({
  typography: {
    fontFamily: [
      '"Inter"',
      '"Noto Sans SC Variable"',
      'sans-serif'
    ].join(','),
  },
  palette: {
    mode: 'light',
    background: {
      default: '#f9f9f9',
    },
    text: {
      primary: 'rgba(0,0,0,0.825)',
    },
  },
});

function App() {
  const nextImplKey = useRef(0);
  const [configBase, setConfigBase] = useImmer<LagrangeConfigBase>({
    "Logging": {
      "LogLevel": {
        "Default": "Information",
      }
    },
    "SignServerUrl": "https://sign.lagrangecore.org/api/sign",
    "SignProxyUrl": "",
    "MusicSignServerUrl": "",
    "Account": {
      "Uin": 0,
      "Password": "",
      "Protocol": "Linux",
      "AutoReconnect": true,
      "GetOptimumServer": true
    },
    "Message": {
      "IgnoreSelf": true,
      "StringPost": false
    },
    "QrCode": {
      "ConsoleCompatibilityMode": false
    },
  });

  const [impls, setImpls] = useImmer<{ key: number, config: Implementation }[]>([
    {
      key: -1,
      config: {
        "Type": "ReverseWebSocket",
        "Host": "127.0.0.1",
        "Port": 8080,
        "Suffix": "/onebot/v11/ws",
        "ReconnectInterval": 5000,
        "HeartBeatInterval": 5000,
        "AccessToken": ""
      },
    }
  ]);

  return <ThemeProvider theme={theme}><CssBaseline/>
    <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
      <Toolbar>
        <Typography variant={"h6"} style={{userSelect: "none"}}>
          <b>Lagrange Config Generator</b>
        </Typography>
      </Toolbar>
    </AppBar>
    <Box display={"flex"} flexDirection={"column"} height={"100vh"}>
      <Toolbar/>
      <Box id={"detail"} display={"flex"} flexGrow={1}>
        <Box width={0.6}>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItemText primary={"日志设定"} secondary={"有关日志等级的设定"}/>
            <ListItem>
              <ListItemText primary={"默认日志等级"} secondary={"如需上报 Issue 请设置为 Trace"}/>
              <Select
                  labelId="Logging:LogLevel:Default"
                  id="Logging:LogLevel:Default"
                  value={configBase.Logging.LogLevel.Default}
                  onChange={e => setConfigBase(draft => {
                    draft.Logging.LogLevel.Default = e.target.value as string;
                  })}
                  sx={{minWidth: 0.3}}
                  variant={"outlined"}
              >
                {[
                  "Trace", "Debug", "Information", "Warning", "Error", "Critical", "None"
                ].map(item =>
                    <MenuItem key={`Logging.LogLevel.Default=${item}`} value={item}>{item}</MenuItem>)
                }
              </Select>
            </ListItem>
          </List>
          <Divider/>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItemText primary={"签名设定"} secondary={"有关签名服务的设定"}/>
            <ListItem>
              <ListItemText primary={"签名服务器地址"} secondary={"请注意协议版本是否匹配"}/>
              <TextField
                  value={configBase.SignServerUrl}
                  onChange={e => setConfigBase(draft => {
                    draft.SignServerUrl = e.target.value;
                  })}
                  sx={{width: 0.5}}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"签名代理服务器地址"} secondary={"仅支持 HTTP 代理，e.g. http://127.0.0.1:7890"}/>
              <TextField
                  value={configBase.SignProxyUrl}
                  onChange={e => setConfigBase(draft => {
                    draft.SignProxyUrl = e.target.value;
                  })}
                  sx={{width: 0.5}}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"音乐卡片签名服务器地址"}/>
              <TextField
                  value={configBase.MusicSignServerUrl}
                  onChange={e => setConfigBase(draft => {
                    draft.MusicSignServerUrl = e.target.value;
                  })}
                  sx={{width: 0.5}}
              />
            </ListItem>
          </List>
          <Divider/>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItemText primary={"账号设定"} secondary={"有关账号信息的设定"}/>
            <ListItem>
              <ListItemText primary={"Uin"} secondary={"QQ 号"}/>
              <TextField
                  defaultValue={0} // 这里不使用 value 是因为 value 可能会导致输入框无法输入
                  onChange={e => setConfigBase(draft => {
                    draft.Account.Uin = parseInt(e.target.value) || 0;
                  })}
                  sx={{width: 0.3}}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"密码"} secondary={"留空以使用扫码登录"}/>
              <TextField
                  value={configBase.Account.Password}
                  onChange={e => setConfigBase(draft => {
                    draft.Account.Password = e.target.value;
                  })}
                  sx={{width: 0.3}}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"协议"}/>
              <Select
                  labelId="Account:Protocol"
                  id="Account:Protocol"
                  value={configBase.Account.Protocol}
                  onChange={e => setConfigBase(draft => {
                    draft.Account.Protocol = e.target.value as string;
                  })}
                  sx={{minWidth: 0.3}}
                  variant={"outlined"}
              >
                {[
                  "Linux", "MacOs", "Windows"
                ].map(item =>
                    <MenuItem key={`Account.Protocol=${item}`} value={item}>{item}</MenuItem>)
                }
              </Select>
            </ListItem>
            <ListItem>
              <ListItemText primary={"自动重连"}/>
              <Switch
                  checked={configBase.Account.AutoReconnect}
                  onChange={e => setConfigBase(draft => {
                    draft.Account.AutoReconnect = e.target.checked;
                  })}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"获取最优服务器"}/>
              <Switch
                  checked={configBase.Account.GetOptimumServer}
                  onChange={e => setConfigBase(draft => {
                    draft.Account.GetOptimumServer = e.target.checked;
                  })}
              />
            </ListItem>
          </List>
          <Divider/>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItemText primary={"消息设定"} secondary={"有关消息上报的设定"}/>
            <ListItem>
              <ListItemText primary={"忽略自身消息"}/>
              <Switch
                  checked={configBase.Message.IgnoreSelf}
                  onChange={e => setConfigBase(draft => {
                    draft.Message.IgnoreSelf = e.target.checked;
                  })}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={"上报为 CQ 码"}/>
              <Switch
                  checked={configBase.Message.StringPost}
                  onChange={e => setConfigBase(draft => {
                    draft.Message.StringPost = e.target.checked;
                  })}
              />
            </ListItem>
          </List>
          <Divider/>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItemText primary={"二维码设定"} secondary={"有关登录二维码显示的设定"}/>
            <ListItem>
              <ListItemText primary={"控制台兼容模式"} secondary={"当二维码显示异常可尝试启用该模式"}/>
              <Switch
                  checked={configBase.QrCode.ConsoleCompatibilityMode}
                  onChange={e => setConfigBase(draft => {
                    draft.QrCode.ConsoleCompatibilityMode = e.target.checked;
                  })}
              />
            </ListItem>
          </List>
          <Divider/>
          <List sx={{paddingX: 3, paddingY: 2}}>
            <ListItem disablePadding={true}>
              <ListItemText primary={"网络服务设定"} secondary={"配置 Lagrange.OneBot 暴露在网络中的服务"}/>
            </ListItem>
            <ListItem disablePadding={true}>
              <Button onClick={() => {
                setImpls(draft => {
                  draft.push({
                    key: nextImplKey.current++,
                    config: {
                      "Type": "Http",
                      "Host": "*",
                      "Port": 8083,
                      "AccessToken": ""
                    },
                  });
                });
              }}>增加 HTTP 实现</Button>
              <Button onClick={() => {
                setImpls(draft => {
                  draft.push({
                    key: nextImplKey.current++,
                    config: {
                      "Type": "HttpPost",
                      "Host": "127.0.0.1", // 可以填写前缀协议, 例如 `https://`
                      "Port": 8082,
                      "Suffix": "/",
                      "HeartBeatInterval": 5000,
                      "HeartBeatEnable": true,
                      "AccessToken": "",
                      "Secret": ""
                    }
                  });
                });
              }}>增加 HTTP Post 实现</Button>
              <Button onClick={() => {
                setImpls(draft => {
                  draft.push({
                    key: nextImplKey.current++,
                    config: {
                      "Type": "ForwardWebSocket",
                      "Host": "127.0.0.1",
                      "Port": 8081,
                      "HeartBeatInterval": 5000,
                      "HeartBeatEnable": true,
                      "AccessToken": ""
                    },
                  });
                });
              }}>增加 WebSocket 实现</Button>
              <Button onClick={() => {
                setImpls(draft => {
                  draft.push({
                    key: nextImplKey.current++,
                    config: {
                      "Type": "ReverseWebSocket",
                      "Host": "127.0.0.1",
                      "Port": 8080,
                      "Suffix": "/onebot/v11/ws",
                      "ReconnectInterval": 5000,
                      "HeartBeatInterval": 5000,
                      "AccessToken": ""
                    },
                  });
                });
              }}>增加反向 WebSocket 实现</Button>
            </ListItem>
            {
              impls.map(({key, config}, index) => {
                if (config.Type === "ReverseWebSocket") {
                  return <List key={key} sx={{padding: 2, marginY: 1}}>
                    <ListItem disablePadding={true}>
                      <ListItemText primary={"反向 WebSocket 实现"} secondary={`${config.Host}${config.Suffix}`}/>
                      <Button onClick={() => setImpls(draft => {
                        draft.splice(index, 1);
                      })}>移除</Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"主机地址"} secondary={"域名或 IP"}/>
                      <TextField
                          value={config.Host}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Host = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"端口"}/>
                      <TextField
                          value={config.Port}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Port = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Suffix"}/>
                      <TextField
                          value={config.Suffix}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.Suffix = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"重连间隔"}/>
                      <TextField
                          value={config.ReconnectInterval}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.ReconnectInterval = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"心跳间隔"}/>
                      <TextField
                          value={config.HeartBeatInterval}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.HeartBeatInterval = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Access Token"}/>
                      <TextField
                          value={config.AccessToken}
                          onChange={e => setImpls(draft => {
                            draft[index].config.AccessToken = e.target.value;
                          })}
                          sx={{width: 0.5}}
                      />
                    </ListItem>
                  </List>;
                } else if (config.Type === "ForwardWebSocket") {
                  return <List key={key} sx={{padding: 2, marginY: 1}}>
                    <ListItem disablePadding={true}>
                      <ListItemText primary={"正向 WebSocket 实现"} secondary={`${config.Host}:${config.Port}`}/>
                      <Button onClick={() => setImpls(draft => {
                        draft.splice(index, 1);
                      })}>移除</Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"监听地址"} secondary={"需要绑定的网卡 IP，不需要绑定特定 IP 请保持原状"}/>
                      <TextField
                          value={config.Host}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Host = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"端口"}/>
                      <TextField
                          value={config.Port}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Port = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"心跳间隔"}/>
                      <TextField
                          value={config.HeartBeatInterval}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.HeartBeatInterval = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"启用心跳"}/>
                      <Switch
                          checked={config.HeartBeatEnable}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.HeartBeatEnable = e.target.checked;
                          })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Access Token"}/>
                      <TextField
                          value={config.AccessToken}
                          onChange={e => setImpls(draft => {
                            draft[index].config.AccessToken = e.target.value;
                          })}
                          sx={{width: 0.5}}
                      />
                    </ListItem>
                  </List>;
                } else if (config.Type === "HttpPost") {
                  return <List key={key} sx={{padding: 2, marginY: 1}}>
                    <ListItem disablePadding={true}>
                      <ListItemText primary={"HTTP Post 实现"} secondary={`${config.Host}:${config.Port}${config.Suffix}`}/>
                      <Button onClick={() => setImpls(draft => {
                        draft.splice(index, 1);
                      })}>移除</Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"主机地址"} secondary={"域名或 IP，如需使用 HTTPS 请添加 https:// 前缀"}/>
                      <TextField
                          value={config.Host}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Host = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"端口"}/>
                      <TextField
                          value={config.Port}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Port = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Suffix"}/>
                      <TextField
                          value={config.Suffix}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.Suffix = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"心跳间隔"}/>
                      <TextField
                          value={config.HeartBeatInterval}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.HeartBeatInterval = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"启用心跳"}/>
                      <Switch
                          checked={config.HeartBeatEnable}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.HeartBeatEnable = e.target.checked;
                          })}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Access Token"}/>
                      <TextField
                          value={config.AccessToken}
                          onChange={e => setImpls(draft => {
                            draft[index].config.AccessToken = e.target.value;
                          })}
                          sx={{width: 0.5}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Secret"} secondary={"用于给 HTTP Post 请求签名"}/>
                      <TextField
                          value={config.Secret}
                          onChange={e => setImpls(draft => {
                            // eslint-disable-next-line
                            // @ts-ignore
                            draft[index].config.Secret = e.target.value;
                          })}
                          sx={{width: 0.5}}
                      />
                    </ListItem>
                  </List>;
                } else { // Http
                  return <List key={key} sx={{padding: 2, marginY: 1}}>
                    <ListItem disablePadding={true}>
                      <ListItemText primary={"HTTP 实现"} secondary={`${config.Host}:${config.Port}`}/>
                      <Button onClick={() => setImpls(draft => {
                        draft.splice(index, 1);
                      })}>移除</Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"主机地址"} secondary={"需要绑定的网卡 IP，不需要绑定特定 IP 请保持原状"}/>
                      <TextField
                          value={config.Host}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Host = e.target.value;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"端口"}/>
                      <TextField
                          value={config.Port}
                          onChange={e => setImpls(draft => {
                            draft[index].config.Port = parseInt(e.target.value) || 0;
                          })}
                          sx={{width: 0.3}}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={"Access Token"}/>
                      <TextField
                          value={config.AccessToken}
                          onChange={e => setImpls(draft => {
                            draft[index].config.AccessToken = e.target.value;
                          })}
                          sx={{width: 0.5}}
                      />
                    </ListItem>
                  </List>;
                }
              })
            }
          </List>
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"} gap={1} justifyContent={"center"}
               paddingY={1}>
            <Typography variant={"caption"}>
              © {new Date().getFullYear()} Lagrange.Dev
            </Typography>
          </Box>
        </Box>
        <Drawer
            sx={{
              width: 0.4,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 0.4,
                boxSizing: 'border-box',
                padding: 3
              },
            }}
            variant="permanent"
            anchor="right"
        >
          <Toolbar/>
          <TextField
              multiline={true}
              fullWidth={true}
              value={JSON.stringify({
                ...configBase,
                Implementations: impls.map(({config}) => config)
              }, null, 4)}
              InputProps={{
                sx: {
                  fontFamily: [
                    '"JetBrains Mono Variable"',
                    '"Noto Sans SC Variable"',
                    'monospace'
                  ],
                  fontSize: 12,
                }
              }}
          />
        </Drawer>
      </Box>
    </Box>
  </ThemeProvider>
}

export default App
