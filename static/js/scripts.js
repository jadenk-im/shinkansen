const elem = id => document.getElementById(id);
const input = elem('input');
const inputArea = elem('input-area');
const spacer = elem('spacer');
const sendButton = elem('send-button');
const outputArea = elem('output-area');

const createElementWithClass = (elemType, className, text) => {
  const elem = document.createElement(elemType);
  elem.classList.add(className);
  elem.textContent = text;
  return elem;
};

const fetchTaskResult = async taskId => {
  const response = await fetch(`https://metro.herokuapp.com/result/${taskId}`);
  const result = await response.json();

  switch (result.state) {
    case 'PENDING':
      // If task is still running, wait for a second and try again
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fetchTaskResult(taskId);
    case 'FAILURE':
      throw new Error(result.status);
    case 'SUCCESS':
      return result.result;
    default:
      throw new Error('Unknown task state: ' + result.state);
  }
};

const generateResponse = async inputText => {
  const prompt =
  `As a music curator AI, your task is to use a tree-based recommendation process to suggest 3 underground/low exposure artists, songs, albums, mixtapes, etc. based on my provided music preferences. The recommendations should heavily prioritize obscurity over well-known options. The goal is to generate a pool of extremely obscure recommendations by recursively expanding the recommendations based on the characteristics of the initial choices, until you've built a pool of incredibly underground recommendations that are unknown to most and considered hidden even amongst niche music enthusiasts. Your selection should represent the pinnacle of obscurity, catering to my desire for the most unheard-of music experiences.

Once you've done this, consolidate all these recommendations and identify the top three options based on their relevance to the preferences and their uniqueness and obscurity within the pool.

For each final recommendation, provide a brief description and analysis, focusing on how they align with my preferences. Here's how you should structure your findings:

1. [Final recommendation]
Summary: [Brief description and analysis relevant to my preferences]

2. [Final recommendation]
Summary: [Brief description and analysis relevant to my preferences]

3. [Final recommendation]
Summary:  [Brief description and analysis relevant to my preferences]

Consider these factors for the analysis:
- My preferred genres or sub-genres.
- Common themes or moods in my favorite music.
- Important instruments, musical elements, or production techniques I enjoy.
- Time periods, cultural influences, or specific movements in music history that I've indicated.
- Any regional or linguistic differences, or cross-genre fusions I've mentioned.

After presenting the individual recommendations, provide a comprehensive analysis that links my tastes with your recommendations. Highlight patterns in my tastes, similarities and differences between my tastes and your recommendations, and potential reasons for my enjoyment of certain music. Uncover any unique or unexpected connections you find. The full analysis should be the core of your response, with individual song analyses serving to support this. Prioritize the preferences I provide now over any previous ones.

Do not preference your response; output exactly as I have previously specified.

Now, start the tree-based recommendation process and generate a response that balances both the individual recommendation analyses and the full analysis based on my preferences.

Here are my musical preferences:
${inputText}`;

  const formData = new FormData();
  formData.append("prompt", prompt);

  try {
    const askResponse = await fetch("https://metro.herokuapp.com/ask", {
      method: "POST",
      body: formData,
    });
    if (!askResponse.ok) throw new Error(`HTTP error! status: ${askResponse.status}`);
    
    const askResult = await askResponse.json();
    const generatedText = await fetchTaskResult(askResult.task_id);
    return generatedText === '' ? 'Sorry, no results were found based on your music preferences.' : generatedText;
  } catch (error) {
    console.error(error);
    return 'Sorry, an error occurred while generating the response.';
  }
};

const unescape_unicode = (text) => {
  return text.replace(/\\u[\dA-F]{4}/gi,
    (match) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));
};

const displayResponse = async () => {
  const inputDiv = createElementWithClass('div', 'text', '');
  const inputText = input.value;
  inputDiv.innerHTML = input.value.replace(/(\r\n|\n|\r)/gm, '<br>');
  outputArea.insertBefore(inputDiv, spacer);
  input.value = '';
  input.style.height = 'auto';
  inputDiv.scrollIntoView({ behavior: 'smooth' });

  sendButton.disabled = true;
  sendButton.classList.add('loading');
  sendButton.style.width = `${sendButton.offsetWidth}px`;
  sendButton.innerHTML = '<div class="ellipsis"><p id="dot-a">.</p><p id="dot-b">.</p><p id="dot-c">.</p></div>';

  try {
    const response = await generateResponse(inputText);
    const responseDiv = createElementWithClass('div', response.startsWith("Sorry,") ? 'error' : 'response', '');
    responseDiv.innerHTML = `<p>${response.replace(/(\r\n|\n|\r)/gm, '<br>')}</p>`;

    responseDiv.style.position = 'relative';

    const copyButton = createElementWithClass('button', 'copy-button', 'Copy');
    copyButton.addEventListener('click', () => {
      const textarea = document.createElement('textarea');
      textarea.value = response;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyButton.textContent = 'Copied!';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
    });
    responseDiv.appendChild(copyButton);

    outputArea.insertBefore(responseDiv, spacer);
  } catch (error) {
    const responseDiv = createElementWithClass('div', 'error', '');
    responseDiv.textContent = `Error: ${error.message}`;
    outputArea.insertBefore(responseDiv, spacer);
  } finally {
    sendButton.disabled = false;
    sendButton.classList.remove('loading');
    sendButton.textContent = 'Send';
    sendButton.style.width = '';
  }
};

const handleInputChange = () => {
  const inputValue = input.value.trim();
  var isEmpty = inputValue.length === 0;
  sendButton.disabled = isEmpty
  if (isEmpty) {
    sendButton.classList.add('empty');
  } else {
    sendButton.classList.remove('empty');
  }
};

let previousScrollHeight = input.scrollHeight;
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
  previousScrollHeight = input.scrollHeight;
});

sendButton.addEventListener('click', displayResponse);

input.addEventListener('input', handleInputChange);
handleInputChange();

input.addEventListener('keydown', event => {
  // Check the screen size
  if (window.innerWidth < 768) {
    return; // Allow default behavior on larger screens
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    displayResponse(); // Call the displayResponse function manually
  }
});
