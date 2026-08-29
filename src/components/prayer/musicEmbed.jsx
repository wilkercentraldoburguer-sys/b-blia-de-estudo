/**
 * Utilitário pra reconhecer um link de música/vídeo colado pelo usuário
 * (Spotify, YouTube/YouTube Music, Apple Music ou Deezer) e transformá-lo
 * num link de EMBED oficial de cada serviço - sem precisar de login, conta
 * de desenvolvedor nem chave de API. Cada um desses 4 serviços publica um
 * player incorporável próprio, gratuito e sem autenticação:
 *
 *  - Spotify: open.spotify.com/embed/...
 *  - YouTube: youtube.com/embed/...
 *  - Apple Music: embed.music.apple.com/... (mesma URL do music.apple.com,
 *    só troca o começo do domínio)
 *  - Deezer: widget.deezer.com/widget/...
 *
 * Serviços que NÃO entram aqui, e por quê (ver Oracao.jsx pra explicação
 * completa ao usuário):
 *  - Amazon Music: não tem nenhum player incorporável público/oficial pra
 *    playlists - só uma API de desenvolvedor voltada pra Alexa/apps
 *    licenciados, que exige aprovação comercial da Amazon.
 *  - "Video Lite": é um aplicativo instalado no celular do usuário, não um
 *    serviço na internet - não existe link ou API pra "conectar" um app
 *    local de dentro de uma página web.
 */

function extractSpotify(url) {
  const match = url.match(/open\.spotify\.com\/(playlist|track|album|artist|show|episode)\/([A-Za-z0-9]+)/);
  if (!match) return null;
  const [, type, id] = match;
  return {
    service: "spotify",
    label: "Spotify",
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`,
    height: 352,
  };
}

function extractYouTube(url) {
  let videoId = null;
  let playlistId = null;

  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
  if (shortMatch) videoId = shortMatch[1];

  const videoMatch = url.match(/[?&]v=([A-Za-z0-9_-]+)/);
  if (videoMatch) videoId = videoMatch[1];

  const listMatch = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
  if (listMatch) playlistId = listMatch[1];

  const isYouTubeHost = /(^|\.)youtube\.com$|(^|\.)music\.youtube\.com$|(^|\.)youtu\.be$/.test(
    (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return "";
      }
    })()
  );

  if (!isYouTubeHost || (!videoId && !playlistId)) return null;

  const embedUrl = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}`
    : `https://www.youtube.com/embed/${videoId}`;

  return {
    service: "youtube",
    label: url.includes("music.youtube.com") ? "YouTube Music" : "YouTube",
    embedUrl,
    height: 315,
  };
}

function extractAppleMusic(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }
  if (hostname !== "music.apple.com") return null;

  const embedUrl = url.replace("music.apple.com", "embed.music.apple.com");
  return {
    service: "apple",
    label: "Apple Music",
    embedUrl,
    height: 450,
  };
}

function extractDeezer(url) {
  const match = url.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|track|album)\/(\d+)/);
  if (!match) return null;
  const [, type, id] = match;
  return {
    service: "deezer",
    label: "Deezer",
    embedUrl: `https://widget.deezer.com/widget/dark/${type}/${id}`,
    height: type === "track" ? 200 : 350,
  };
}

/**
 * Recebe um link colado pelo usuário e retorna
 * { service, label, embedUrl, height } se reconhecer o serviço, ou null se
 * não reconhecer (link de um serviço não suportado, ou link inválido).
 * Nunca "chuta" um embed - só retorna algo quando reconhece de fato o
 * formato oficial de um dos 4 serviços suportados.
 */
export function parseMusicUrl(rawUrl) {
  const url = (rawUrl || "").trim();
  if (!url) return null;

  return (
    extractSpotify(url) ||
    extractYouTube(url) ||
    extractAppleMusic(url) ||
    extractDeezer(url) ||
    null
  );
}
