require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const { getPortfolioProfile, getProjectsByCategory, getProjectBySlug, guardPrompt, buildFallbackAnswer } = require('./server/portfolio-agent');

const app = express();
const port = Number(process.env.PORT || 3000);
const githubUsername = 'AshishAlamKabir';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '512kb' }));

async function fetchGitHubMetadata(username = githubUsername) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-ai',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=6&sort=updated&direction=desc`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = await response.json();
  return (Array.isArray(repos) ? repos : []).map((repo) => ({
    name: repo.name,
    description: repo.description || 'No description provided.',
    url: repo.html_url,
    language: repo.language || 'Unknown',
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    updatedAt: repo.updated_at,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    homepage: repo.homepage || '',
  }));
}

function buildPortfolioContext() {
  const profile = getPortfolioProfile();

  return {
    profile,
    skillSummary: profile.skills.map((item) => `${item.name} (${item.category})`).slice(0, 25).join(', '),
    projectSummary: getProjectsByCategory('all').slice(0, 6).map((project) => `${project.title} (${project.category}) - ${project.description}`).join('\n'),
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: openai ? 'openai' : 'grounded-fallback' });
});

app.get('/api/ai/github', async (req, res) => {
  try {
    const repos = await fetchGitHubMetadata();
    res.json({ username: githubUsername, repos });
  } catch (error) {
    const fallbackRepos = getProjectsByCategory('all').slice(0, 6).map((project) => ({
      name: project.title,
      description: project.description,
      url: project.repo,
      language: project.category,
      topics: project.technologies,
      updatedAt: null,
      stars: 0,
      forks: 0,
      homepage: '',
    }));
    res.json({ username: githubUsername, repos: fallbackRepos, fallback: true });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, messages = [], selectedProject, recruiterMode } = req.body || {};
    const lastUserMessage = typeof message === 'string' && message.trim() ? message : Array.isArray(messages) ? [...messages].reverse().find((entry) => entry.role === 'user')?.content : '';

    if (!lastUserMessage || typeof lastUserMessage !== 'string' || !lastUserMessage.trim()) {
      return res.status(400).json({ error: 'A valid message is required.' });
    }

    const safety = guardPrompt(lastUserMessage);
    if (!safety.safe) {
      return res.status(400).json({ error: safety.reason });
    }

    let githubContext = null;
    if (/github|repositories|repo/i.test(lastUserMessage) || recruiterMode) {
      try {
        githubContext = await fetchGitHubMetadata();
      } catch (error) {
        githubContext = getProjectsByCategory('all').slice(0, 6).map((project) => ({
          name: project.title,
          description: project.description,
          url: project.repo,
          language: project.category,
          topics: project.technologies,
        }));
      }
    }

    const portfolioContext = buildPortfolioContext();
    const systemPrompt = `You are Kabir AI, the portfolio assistant for Ashish Alam Kabir. You only answer using the verified portfolio data provided below. Never invent education, experience, projects, technologies, capabilities, results, or job history. If data is missing, say so explicitly. Keep answers concise and professional. When asked about a project, use this structure: Problem, Solution, Technologies, Implementation, Outcome, Relevant links. Only include sections if they are supported by the known portfolio data. For recruiter-mode requests, compare the job description to the verified portfolio evidence and clearly separate strong matches from missing evidence.\n\nPortfolio context:\n${JSON.stringify({ ...portfolioContext, githubContext }, null, 2)}`;

    const history = Array.isArray(messages) ? messages.slice(-8).map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : 'user',
      content: String(entry.content || '').slice(0, 1800),
    })) : [];

    const projectContext = selectedProject ? getProjectBySlug(selectedProject) || getProjectsByCategory('all').find((project) => project.title.toLowerCase() === String(selectedProject).toLowerCase()) : null;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: `${projectContext ? `Project context: ${JSON.stringify(projectContext, null, 2)}\n\n` : ''}${recruiterMode ? `Recruiter mode job description:\n${recruiterMode}\n\n` : ''}${lastUserMessage}` },
    ];

    if (!openai) {
      const fallback = buildFallbackAnswer(lastUserMessage, selectedProject || null);
      return res.json({
        answer: fallback.answer,
        relatedQuestions: fallback.relatedQuestions || [],
        actions: [],
      });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 500,
      messages: formattedMessages,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() || 'I could not generate an answer from the portfolio data right now.';

    res.json({
      answer,
      relatedQuestions: [],
      actions: [],
    });
  } catch (error) {
    console.error('AI agent error:', error.message);
    const fallbackMessage = typeof req?.body?.message === 'string' ? req.body.message : '';
    const fallback = buildFallbackAnswer(fallbackMessage, req?.body?.selectedProject || null);
    res.status(200).json({
      answer: fallback.answer,
      relatedQuestions: fallback.relatedQuestions || [],
      actions: [],
      warning: 'AI service unavailable; using portfolio-grounded fallback mode.',
    });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
  console.log(`Portfolio AI server running on http://localhost:${port}`);
});
