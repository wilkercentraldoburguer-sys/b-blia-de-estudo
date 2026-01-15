const TOKEN_KEY = "abiblia_token";
const API_BASE = "https://www.abibliadigital.com.br/api";

/**
 * Salva o token da API
 */
export function saveAPIToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Obtém o token da API
 */
export function getAPIToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Verifica se há token configurado
 */
export function hasAPIToken() {
  const token = getAPIToken();
  return token && token.trim().length > 0;
}

/**
 * Remove o token da API
 */
export function removeAPIToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Testa a conexão com a API
 */
export async function testAPIConnection() {
  const token = getAPIToken();
  
  if (!token) {
    return {
      success: false,
      message: "Token não configurado",
      details: null
    };
  }

  const t0 = performance.now();
  
  try {
    // Testa com um endpoint simples (versões disponíveis)
    const response = await fetch(`${API_BASE}/versions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const timeMs = Math.round(performance.now() - t0);
    
    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Token inválido ou sem permissão",
        details: {
          status: response.status,
          timeMs
        }
      };
    }
    
    if (response.status === 429) {
      return {
        success: false,
        message: "Limite de requisições excedido, tente novamente em alguns minutos",
        details: {
          status: response.status,
          timeMs
        }
      };
    }
    
    if (response.status >= 500) {
      return {
        success: false,
        message: "Erro interno da API, tente novamente mais tarde",
        details: {
          status: response.status,
          timeMs
        }
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        message: `Erro desconhecido (status ${response.status})`,
        details: {
          status: response.status,
          timeMs
        }
      };
    }
    
    return {
      success: true,
      message: "Conexão estabelecida com sucesso!",
      details: {
        status: response.status,
        timeMs
      }
    };
    
  } catch (error) {
    const timeMs = Math.round(performance.now() - t0);
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: false,
        message: "Erro de rede - verifique sua conexão",
        details: {
          status: 'ERR_NETWORK',
          timeMs
        }
      };
    }
    
    return {
      success: false,
      message: `Erro: ${error.message || 'Erro desconhecido'}`,
      details: {
        status: 'ERROR',
        timeMs
      }
    };
  }
}