# Project Overview
Develop a music recommendation system that utilizes GPT-4 API to recommend new music to users based on their preferences and provide them with interesting analysis about their music tastes. All code for the project is hosted on this repository and the web app can be used [here](https://metro.herokuapp.com).

___

# Original Direction
Originally, my idea was to fine-tune ChatGPT on data which I would scrape from a service specializing in independent music such as Bandcamp, in order to get it to recommend more obscure music. My process was as follows:

## 1. Collect Data
Collect a large dataset of music tracks along with associated metadata, such as artist, genre, tempo, key, etc.

## 2. Preprocess the data
Clean and normalize the data, extract features, and encode the music tracks in a format that can be fed into the ChatGPT model.

## 3. Train the ChatGPT model
Train the model to recommend more obscure music music and extract insights based on the dataset.

## 4. Evaluate and refine
Evaluate the performance of the model and the recommendation system and refine them based on user feedback.

During this process, however, I realized that I could accomplish similar goals using some clever prompt engineering. The upsides to this approach would be that it would require significantly less resources, since no training would be required; it would be much quicker; and it would be easy and fast to improve, since I would not have to retrain a model each time to increase performance. The downsides, however, would be that the model would be limited to recommending artists that were already originally part of its training data and that I would be limited to working with the model as it was already trained, without the ability to actually improve the model itself. Despite this, I found the prompt engineering approach to be more interesting, so I proceeded down this route.

___

# New Direction
## Original Prompt
My original prompt was as follows:

```
As an expert musical curator, recommend 3 underground/low exposure artists, songs, or albums based on my preferences. Analyze key elements (e.g., BPM, time signature, instruments) and present your findings as follows (first, all recommendations, then, full analysis):

1. [ARTIST/SONG/ALBUM]
   Summary: [DESCRIPTION, ANALYSIS]

2. [ARTIST/SONG/ALBUM]
   Summary: [DESCRIPTION, ANALYSIS]

3. [ARTIST/SONG/ALBUM]
   Summary: [DESCRIPTION, ANALYSIS]

[FULL ANALYSIS: Examine patterns in my taste, similarities and differences between my tastes and your recommendations, and reasons for my enjoyment of certain music. Highlight any unique or unexpected connections you find.]

Consider these questions:
1. Preferred genres or subgenres?
2. Common themes or moods? Any recurring lyrical topics?
3. Important instruments, musical elements, or production techniques?
4. Time periods, cultural influences, or specific movements in music history?
5. Regional or linguistic differences, or any cross-genre fusions?

Incorporate relevant answers into the analysis. Use this information to curate personalized recommendations, including a mix of artists, songs, and albums. Prioritize underground music and unexpected recommendations. If I've shared preferences before, consider them but prioritize the ones I provide now.

 My musical preferences:

{INPUT TEXT}
```

This worked well to generally recommend artists within the scope of the user’s musical preferences, but it fell short in terms of being able to recommend obscure artists. It mainly stuck with the same set of relatively well-known artists and albums and would cycle through them each time I prompted it with the same artists.

## Optimization Prompt
During the process of optimizing the prompt, I had ChatGPT help me identify and solve critical issues. I developed the following prompt (based on the discoveries of SmartGPT) to help me optimize my final prompt more quickly and efficiently:

```
As an expert prompt engineer, optimize the following prompt to solve the following issue with the current prompt and generate three potential responses: {PROMPT ISSUE GOES HERE}

Evaluate each response for flaws or faulty logic, then identify the best one and improve upon it. Present the final output as:
1. Core problem: [CORE PROBLEM PROMPT IS TRYING TO SOLVE]
2. Modifications: [WHAT CHANGES YOU MADE TO OPTIMIZE THE PROMPT]
3. Optimized prompt: [FINAL, OPTIMIZED OUTPUT]

Here is my prompt:
{PROMPT IN QUOTES GOES HERE}
```

## Final Prompt
My final prompt utilized two main features which allowed it to function much better than the previous iterations. First, it gave a very specific description of what defined obscure artists. Second, and more importantly, it utilized a tree-based approach the generate the recommendations. This solved the two big problems which plagued the previous versions of the prompt: 1) it would now recommend underground music, rather than well-known music and 2) it would now make novel suggestions even when prompted with the same tastes.

```
As a music curator AI, your task is to use a tree-based recommendation process to suggest 3 underground/low exposure artists, songs, albums, mixtapes, etc. based on my provided music preferences. The recommendations should heavily prioritize obscurity over well-known options. The goal is to generate a pool of extremely obscure recommendations by recursively expanding the recommendations based on the characteristics of the initial choices, until you've built a pool of incredibly underground recommendations that are unknown to most and considered hidden even amongst niche music enthusiasts. Your selection should represent the pinnacle of obscurity, catering to my desire for the most unheard-of music experiences.

Once you've done this, consolidate all these recommendations and identify the top three options based on their relevance to the preferences and their uniqueness and obscurity within the pool.

For each final recommendation, provide a brief description and analysis, focusing on how they align with my preferences. Here's how you should structure your findings:

1. [FINAL RECOMMENDATION]
Summary: [BRIEF DESCRIPTION AND ANALYSIS RELEVANT TO MY PREFERENCES]

2. [FINAL RECOMMENDATION]
Summary: [BRIEF DESCRIPTION AND ANALYSIS RELEVANT TO MY PREFERENCES]

3. [FINAL RECOMMENDATION]
Summary: [BRIEF DESCRIPTION AND ANALYSIS RELEVANT TO MY PREFERENCES]

Consider these factors for the analysis:
- My preferred genres or sub-genres.
- Common themes or moods in my favorite music.
- Important instruments, musical elements, or production techniques I enjoy.
- Time periods, cultural influences, or specific movements in music history that I've indicated.
- Any regional or linguistic differences, or cross-genre fusions I've mentioned.

After presenting the individual recommendations, provide a comprehensive analysis that links my tastes with your recommendations. Highlight patterns in my tastes, similarities and differences between my tastes and your recommendations, and potential reasons for my enjoyment of certain music. Uncover any unique or unexpected connections you find. The full analysis should be the core of your response, with individual song analyses serving to support this. Prioritize the preferences I provide now over any previous ones.

Do not preface your response; output exactly as I have previously specified.

Now, start the tree-based recommendation process and generate a response that balances both the individual recommendation analyses and the full analysis based on my preferences.

Here are my musical preferences:
{INPUT TEXT}
```

### Debug
To debug my prompt and make sure that it was correctly generating the recommendation tree as I instructed it to, I appended this statement at the end:

```
Full tree:
[Entire recommendation tree you used to find the final three recommendations]
```

___

# Future Direction
Currently, the project is available as a Heroku app, accessible [here](https://metro.herokuapp.com). In the future, I hope to expand the scope of this project by fine-tuning the GPT-4 model on a synthetic dataset. This dataset will be fully automated by taking advantage of GPT-4’s inherent capabilities to generate data. I would generate a set of prompts to automatically inject into GPT, in order to generate output and test this output against Spotify using its API, so that when prompted to give musical recommendations, it generally biases towards more obscure artists with less exposure. The specifics of the process are as follows:

1. Set up a Google Colab environment with the necessary libraries installed.
2. Initialize the ChatGPT model with a large pre-existing dataset.
3. Define a set of prompts for the model to complete.
4. Use the `generate` method in the Transformers library to generate recommendations for each prompt.
5. Use Spotify’s API to to filter out any generated recommendations that do not have less than 10,000 monthly listeners on Spotify.
6. Store the filtered recommendations in a dataset file in a format that can be used for fine-tuning.
7. Repeat steps 3-6 with new prompts to generate additional examples and improve the model's performance.
8. Use the filtered dataset to fine-tune the ChatGPT model.
9. Integrate the fine-tuned model into the web app to generate recommendations based on the user's input.
