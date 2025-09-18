import { stripIndents } from '../utils/stripIndent.js';

export const dataVisualizationInstructions = stripIndents`
## DATA VISUALIZATION DETAILED INSTRUCTIONS

### Data Analysis Methodology
Follow this systematic approach for data analysis:

1. **Data Profiling**:
   - Examine data types, ranges, missing values, outliers
   - Calculate basic statistics (mean, median, mode, std dev)
   - Identify data quality issues and inconsistencies
   - Assess data completeness and reliability

2. **Relationship Discovery**:
   - Identify correlations between variables
   - Look for trends, patterns, and seasonality
   - Detect outliers and anomalies
   - Find groupings and clusters in data

3. **Business Context**:
   - Understand what the data represents and why it matters
   - Identify key performance indicators (KPIs)
   - Determine business questions the data can answer
   - Consider industry-specific metrics and benchmarks

4. **Audience Consideration**:
   - Determine appropriate level of detail and complexity
   - Consider technical expertise of viewers
   - Align with business objectives and decision-making needs
   - Plan for different consumption formats (dashboard, report, presentation)

5. **Story Identification**:
   - Find the key narrative the data tells
   - Identify most important insights and trends
   - Prioritize findings by business impact
   - Structure insights logically for maximum impact

### Chart Selection Decision Tree

**Step 1: What is your primary goal?**
- Show trends over time → Line/Area charts
- Compare categories → Bar/Column charts
- Show relationships → Scatter/Bubble charts
- Display composition → Pie/Stacked charts
- Show distribution → Histogram/Box plots
- Display geographic data → Maps/Choropleth
- Show hierarchical data → Treemap/Sunburst

**Step 2: How many data series?**
- Single series → Simple charts (line, bar, pie)
- 2-5 series → Grouped/stacked charts, multiple axes
- 6+ series → Small multiples, heat maps, or dashboard approach

**Step 3: What's your audience's data literacy?**
- Executive level → Simple, high-impact visuals with clear insights
- Analyst level → Complex charts with detailed data
- General audience → Intuitive charts with extensive labeling

**Step 4: What's the data size?**
- Small datasets (< 50 points) → Most chart types work
- Medium datasets (50-500 points) → Aggregation may be needed
- Large datasets (500+ points) → Sampling, binning, or interactive charts

### Chart Type Guidelines

**Line Charts:**
- Best for: Continuous data over time, trends, forecasts
- Use when: You have time series data or want to show change
- Avoid when: Categories are not ordered or data is sparse

**Bar/Column Charts:**
- Best for: Comparing discrete categories, rankings
- Use when: Categories have clear labels and values can be compared
- Avoid when: Too many categories (>10) or when showing parts of a whole

**Scatter Plots:**
- Best for: Relationships between two continuous variables
- Use when: Looking for correlations, outliers, or clusters
- Avoid when: Variables are categorical or relationship is obvious

**Pie Charts:**
- Best for: Simple part-to-whole relationships (max 5-7 categories)
- Use when: Showing percentages and proportions are important
- Avoid when: Comparing small differences or showing changes over time

**Heat Maps:**
- Best for: Large datasets, correlation matrices, geographic data
- Use when: Showing patterns across two dimensions
- Avoid when: Data is sparse or patterns are not clear

### Visualization Best Practices

**Color Usage:**
- Use color purposefully to highlight insights
- Ensure accessibility (colorblind-friendly palettes)
- Maintain consistency across related charts
- Use neutral colors for background elements

**Labeling:**
- Provide clear, descriptive titles that explain the insight
- Label axes clearly with units of measurement
- Use data labels sparingly to avoid clutter
- Include source attribution and data collection dates

**Scale and Proportions:**
- Start bar charts at zero to avoid misleading comparisons
- Use appropriate axis ranges to show true relationships
- Maintain consistent scales across related charts
- Break scales only when necessary and clearly indicate

**Annotation and Context:**
- Highlight key insights and important data points
- Provide context for what "good" or "bad" performance looks like
- Add trend lines or reference lines where helpful
- Include confidence intervals for statistical data

**Simplicity:**
- Remove chart junk and unnecessary elements
- Focus on the primary message or insight
- Use white space effectively
- Limit the number of colors and visual elements

### Report Integration Guidelines

**Leading with Insights:**
- Start with the most important finding or conclusion
- Use visualizations to support narrative, not replace it
- Provide clear takeaways for each chart
- Connect charts to business implications

**Providing Context:**
- Explain data sources and methodology
- Include timeframes and any data limitations
- Compare to benchmarks, targets, or historical performance
- Address potential questions or concerns

**Actionable Recommendations:**
- Suggest specific actions based on findings
- Prioritize recommendations by impact and feasibility
- Include next steps and success metrics
- Assign ownership and timelines where appropriate

### Quality Checklist
Before finalizing visualizations:

- [ ] Chart type appropriate for data and message
- [ ] Clear, descriptive titles and labels
- [ ] Proper scale and axis formatting
- [ ] Color scheme accessible and professional
- [ ] Data source and methodology noted
- [ ] Key insights clearly highlighted
- [ ] Export format optimized for intended use
- [ ] Mobile-friendly if needed for responsive reports
`;