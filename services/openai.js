import axios from 'axios';
import FormData from 'form-data';
import config from '../config/index.js';
import { handleFulfilled, handleRejected, handleRequest } from './utils/index.js';

export const ROLE_SYSTEM = 'system';
export const ROLE_AI = 'assistant';
export const ROLE_HUMAN = 'user';

export const FINISH_REASON_STOP = 'stop';
export const FINISH_REASON_LENGTH = 'length';

export const IMAGE_SIZE_256 = '256x256';
export const IMAGE_SIZE_512 = '512x512';
export const IMAGE_SIZE_1024 = '1024x1024';

export const MODEL_GPT_3_5_TURBO = 'gpt-3.5-turbo';
export const MODEL_WHISPER_1 = 'whisper-1';
export const MODEL_GPT_4_TURBO = 'gpt-4-turbo';

const BASE_URL = config.PROVIDER_BASE_URL;

const client = axios.create({
  timeout: config.OPENAI_TIMEOUT,
  headers: {
    'Provieder': '',
    'Accept-Encoding': 'gzip, deflate, compress',
    "HTTP-Referer": `https://line.me`, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": `LINE Chatbot`, // Optional, for including your app on openrouter.ai rankings.
  },
});

client.interceptors.request.use((c) => {
  if (c.headers.Provieder === 'openai') {
    c.headers.Authorization = `Bearer ${config.OPENAI_API_KEY}`;

  } else {
    c.headers.Authorization = `Bearer ${config.PROVIDER_BASE_TOKEN}`;

  }
  return handleRequest(c);
});

client.interceptors.response.use(handleFulfilled, (err) => {
  if (err.response?.data?.error?.message) {
    err.message = err.response.data.error.message;
  }
  return handleRejected(err);
});

const createChatCompletion = ({
  model = config.PROVIDER_BASE_MODEL,
  messages,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
}) => {
  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  }

  let isAboutImageCompletion = false;
  messages.forEach(element => {
    if (element.role === ROLE_AI && element.content === "Get Image！！") {
      body['model'] = MODEL_GPT_4_TURBO;
      isAboutImageCompletion = true;
    }
  });

  if (isAboutImageCompletion) {
    return client.post(config.OPENAI_BASE_URL + '/chat/completions', body, {
      headers: {
        Provieder: 'openai',
      },
    })
  } else {
    return client.post(BASE_URL + '/chat/completions', body)
  }

};

const createTextCompletion = ({
  model = config.PROVIDER_BASE_MODEL,
  prompt,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
  stop = config.OPENAI_COMPLETION_STOP_SEQUENCES,
}) => client.post(BASE_URL + '/completions', {
  model,
  prompt,
  temperature,
  max_tokens: maxTokens,
  frequency_penalty: frequencyPenalty,
  presence_penalty: presencePenalty,
  stop,
});

const createImage = ({
  prompt,
  n = 1,
  size = IMAGE_SIZE_256,
}) => {

  // DALL-E 3 only supports 1024x1024 images.
  if (config.OPENAI_IMAGE_GENERATION_MODEL === 'dall-e-3' && (size === IMAGE_SIZE_256 || size === IMAGE_SIZE_512)) {
    size = IMAGE_SIZE_1024;
  }

  return client.post(config.OPENAI_BASE_URL + '/images/generations', {
    "model": config.OPENAI_IMAGE_GENERATION_MODEL,
    "quality": config.OPENAI_IMAGE_GENERATION_QUALITY,
    prompt,
    n,
    size,
  }, {
    headers: {
      Provieder: 'openai',
    },
  })
};

const createAudioTranscriptions = ({
  buffer,
  file,
  model = MODEL_WHISPER_1,
}) => {
  const formData = new FormData();
  formData.append('file', buffer, file);
  formData.append('model', model);
  var headers = formData.getHeaders();
  headers['Provieder'] = 'openai';
  return client.post(config.OPENAI_BASE_URL + '/audio/transcriptions', formData.getBuffer(), {
    headers: headers,
  });
};

const createVisionTranscriptions = ({
  model = MODEL_GPT_4_TURBO,
  temperature = config.OPENAI_COMPLETION_TEMPERATURE,
  maxTokens = config.OPENAI_COMPLETION_MAX_TOKENS,
  frequencyPenalty = config.OPENAI_COMPLETION_FREQUENCY_PENALTY,
  presencePenalty = config.OPENAI_COMPLETION_PRESENCE_PENALTY,
}) => {

  return client.post(BASE_URL + '/chat/completions', {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  })
};

export {
  createChatCompletion,
  createTextCompletion,
  createImage,
  createAudioTranscriptions,
  createVisionTranscriptions,
};
