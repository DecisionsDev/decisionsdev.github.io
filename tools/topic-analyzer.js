/**
 * Shared topic analysis logic for DecisionsDev repositories
 * Used by both add-topics-to-repos.js and generate-topics-report.js
 */

// Topic mapping rules
const TOPIC_RULES = {
  products: {
    'odm': {
      keywords: ['odm', 'operational decision manager', 'decision manager', 'ibm-odm', 'ibmodm'],
      priority: 10
    },
    'decision-intelligence': {
      keywords: ['ads', 'automation decision services', 'ibm-ads', 'di', 'decision intelligence', 'decision-intelligence'],
      priority: 10
    },
    'bai': {
      keywords: ['business automation insights', 'business-automation-insights', 'ibm-bai'],
      priority: 10
    },
    'cp4ba': {
      keywords: ['cp4ba', 'cloud pak', 'business automation'],
      priority: 5
    }
  },
  components: {
    'decisioncenter': {
      keywords: ['decision center', 'decisioncenter', 'dc-', '-dc-', 'decision-center'],
      priority: 8
    },
    'ruleexecutionserver': {
      keywords: ['rule execution server', 'ruleapp', 'ruleset', 'execution', 'runtime', 'micro-decision', 'res-'],
      priority: 8
    },
    'dsi': {
      keywords: ['dsi', 'decision server insights', 'situation'],
      priority: 8
    },
    'container': {
      keywords: ['docker', 'dockerfile', 'container', 'ondocker', 'kubernetes', 'k8s', 'helm', 'openshift'],
      priority: 7
    },
    'ai': {
      keywords: ['artificial intelligence', 'machine learning', 'llm', 'mcp', 'ai-integration', 'ai-ml'],
      priority: 7
    },
    'designer': {
      keywords: ['designer', 'modeling', 'authoring'],
      priority: 6
    },
    'analytics': {
      keywords: ['analytics', 'dashboard', 'kibana', 'monitoring'],
      priority: 6
    },
    'events': {
      keywords: ['event', 'kafka', 'messaging', 'stream'],
      priority: 6
    }
  }
};

/**
 * Analyze repository name, description, and topics to suggest topics
 * @param {Object} repo - Repository object with name, description, and topics
 * @returns {Object} Suggestions object with products, components, types, and confidence scores
 */
function analyzeRepository(repo) {
  // Include repository name, description, and existing topics in the analysis
  const topicsText = Array.isArray(repo.topics) ? repo.topics.join(' ') : '';
  const text = `${repo.name} ${repo.description || ''} ${topicsText}`.toLowerCase();
  const suggestions = {
    products: [],
    components: [],
    confidence: {}
  };

  // Check each category
  for (const [category, topics] of Object.entries(TOPIC_RULES)) {
    for (const [topic, rule] of Object.entries(topics)) {
      let matches = 0;
      let matchedKeywords = [];

      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          matches++;
          matchedKeywords.push(keyword);
        }
      }

      if (matches > 0) {
        const confidence = (matches / rule.keywords.length) * rule.priority;
        suggestions[category].push(topic);
        suggestions.confidence[topic] = {
          score: confidence,
          matches: matchedKeywords
        };
      }
    }
  }

  // Apply product inference rules
  // Rule 1: If Decision Center, Rule Execution Server, or Container → must be ODM (only if no product selected)
  if (suggestions.products.length === 0 &&
      (suggestions.components.includes('decisioncenter') ||
       suggestions.components.includes('ruleexecutionserver') ||
       suggestions.components.includes('container'))) {
    suggestions.products.push('odm');
    suggestions.confidence['odm'] = {
      score: 10,
      matches: ['inferred from ODM components']
    };
  }

  // Rule 2: Check for decision-assistant → Decision Intelligence
  if (text.includes('decision-assistant') || text.includes('decision assistant')) {
    if (!suggestions.products.includes('decision-intelligence')) {
      suggestions.products.push('decision-intelligence');
      suggestions.confidence['decision-intelligence'] = {
        score: 10,
        matches: ['decision-assistant']
      };
    }
  }

  // Rule 3: Check for decision-engine → ODM (but not if Decision Intelligence is already detected)
  if ((text.includes('decision-engine') || text.includes('decision engine')) &&
      !suggestions.products.includes('decision-intelligence')) {
    if (!suggestions.products.includes('odm')) {
      suggestions.products.push('odm');
      suggestions.confidence['odm'] = {
        score: 10,
        matches: ['decision-engine']
      };
    }
  }

  // Rule 4: If Decision Intelligence → exclude ODM-specific components
  if (suggestions.products.includes('decision-intelligence')) {
    suggestions.components = suggestions.components.filter(
      c => c !== 'decisioncenter' && c !== 'ruleexecutionserver'
    );
    // Remove confidence entries for excluded components
    delete suggestions.confidence['decisioncenter'];
    delete suggestions.confidence['ruleexecutionserver'];
  }

  return suggestions;
}

module.exports = {
  TOPIC_RULES,
  analyzeRepository
};

// Made with Bob
