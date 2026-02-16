/**
 * Shared topic analysis logic for DecisionsDev repositories
 * Used by both add-topics-to-repos.js and generate-topics-report.js
 */

// Topic mapping rules
const TOPIC_RULES = {
  products: {
    'product-odm': {
      keywords: ['odm', 'operational decision manager', 'decision manager', 'ibm-odm', 'ibmodm'],
      priority: 10
    },
    'product-decision-intelligence': {
      keywords: ['ads', 'automation decision services', 'ibm-ads', 'di', 'decision intelligence', 'decision-intelligence'],
      priority: 10
    },
    'product-bai': {
      keywords: ['bai', 'business automation insights', 'insights'],
      priority: 10
    },
    'product-cp4ba': {
      keywords: ['cp4ba', 'cloud pak', 'business automation'],
      priority: 5
    }
  },
  components: {
    'comp-decisioncenter': {
      keywords: ['decision center', 'decisioncenter', 'dc-', '-dc-', 'decision-center'],
      priority: 8
    },
    'comp-ruleexecutionserver': {
      keywords: ['rule execution server', 'ruleapp', 'ruleset', 'execution', 'runtime', 'micro-decision', 'res-'],
      priority: 8
    },
    'comp-dsi': {
      keywords: ['dsi', 'decision server insights', 'insights', 'situation'],
      priority: 8
    },
    'comp-container': {
      keywords: ['docker', 'dockerfile', 'container', 'ondocker', 'kubernetes', 'k8s', 'helm', 'openshift'],
      priority: 7
    },
    'comp-ai': {
      keywords: ['ai', 'mcp', 'llm', 'artificial intelligence', 'machine learning', 'ml'],
      priority: 7
    },
    'comp-designer': {
      keywords: ['designer', 'modeling', 'authoring'],
      priority: 6
    },
    'comp-analytics': {
      keywords: ['analytics', 'dashboard', 'kibana', 'monitoring'],
      priority: 6
    },
    'comp-events': {
      keywords: ['event', 'kafka', 'messaging', 'stream'],
      priority: 6
    }
  },
  types: {
    'type-sample': {
      keywords: ['sample', 'example', 'demo', 'showcase'],
      priority: 9
    },
    'type-tool': {
      keywords: ['tool', 'utility', 'cli', 'extractor', 'loader', 'report'],
      priority: 9
    },
    'type-tutorial': {
      keywords: ['tutorial', 'getting-started', 'gettingstarted', 'step-by-step'],
      priority: 9
    },
    'type-documentation': {
      keywords: ['documentation', 'docs', 'guide'],
      priority: 9
    },
    'type-deployment': {
      keywords: ['deployment', 'install', 'setup', 'configuration'],
      priority: 8
    },
    'type-integration': {
      keywords: ['integration', 'connector', 'adapter', 'bridge', 'mcp'],
      priority: 8
    },
    'type-library': {
      keywords: ['library', 'libs', 'sdk', 'api'],
      priority: 8
    }
  }
};

/**
 * Analyze repository name and description to suggest topics
 * @param {Object} repo - Repository object with name and description
 * @returns {Object} Suggestions object with products, components, types, and confidence scores
 */
function analyzeRepository(repo) {
  const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
  const suggestions = {
    products: [],
    components: [],
    types: [],
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
  // Rule 1: If Decision Center, Rule Execution Server, or Container → must be ODM
  if (suggestions.components.includes('comp-decisioncenter') || 
      suggestions.components.includes('comp-ruleexecutionserver') ||
      suggestions.components.includes('comp-container')) {
    if (!suggestions.products.includes('product-odm')) {
      suggestions.products.push('product-odm');
      suggestions.confidence['product-odm'] = {
        score: 10,
        matches: ['inferred from ODM components']
      };
    }
  }

  // Rule 2: Check for decision-assistant → Decision Intelligence
  if (text.includes('decision-assistant') || text.includes('decision assistant')) {
    if (!suggestions.products.includes('product-decision-intelligence')) {
      suggestions.products.push('product-decision-intelligence');
      suggestions.confidence['product-decision-intelligence'] = {
        score: 10,
        matches: ['decision-assistant']
      };
    }
  }

  // Rule 3: Check for decision-engine → ODM
  if (text.includes('decision-engine') || text.includes('decision engine')) {
    if (!suggestions.products.includes('product-odm')) {
      suggestions.products.push('product-odm');
      suggestions.confidence['product-odm'] = {
        score: 10,
        matches: ['decision-engine']
      };
    }
  }

  // Rule 4: If Decision Intelligence → exclude ODM-specific components
  if (suggestions.products.includes('product-decision-intelligence')) {
    suggestions.components = suggestions.components.filter(
      c => c !== 'comp-decisioncenter' && c !== 'comp-ruleexecutionserver'
    );
    // Remove confidence entries for excluded components
    delete suggestions.confidence['comp-decisioncenter'];
    delete suggestions.confidence['comp-ruleexecutionserver'];
  }

  // Rule 5: Default type is sample if no type is specified
  if (suggestions.types.length === 0 && (suggestions.products.length > 0 || suggestions.components.length > 0)) {
    suggestions.types.push('type-sample');
    suggestions.confidence['type-sample'] = {
      score: 5,
      matches: ['default type']
    };
  }

  return suggestions;
}

module.exports = {
  TOPIC_RULES,
  analyzeRepository
};

// Made with Bob
