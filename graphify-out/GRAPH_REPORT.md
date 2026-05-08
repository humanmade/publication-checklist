# 📊 Graph Analysis Report

**Root:** `.`

## Summary

| Metric | Value |
|--------|-------|
| Nodes | 134 |
| Edges | 136 |
| Communities | 20 |
| Hyperedges | 0 |

### Confidence Breakdown

| Level | Count | Percentage |
|-------|-------|------------|
| EXTRACTED | 115 | 84.6% |
| INFERRED | 21 | 15.4% |
| AMBIGUOUS | 0 | 0.0% |

## 🌟 God Nodes (Most Connected)

| Node | Degree | Community |
|------|--------|-----------|
| namespace | 19 | 0 |
| ChecklistPanel | 19 | 1 |
| ChecklistPanelContent | 14 | 2 |
| StatusIcon | 7 | 4 |
| block_publish_if_failing | 6 | 0 |
| PluginStatusIndicator | 6 | 7 |
| ConfirmOverrideHelpText | 6 | 6 |
| ChecklistPanel | 6 | 8 |
| ChecklistItem | 6 | 3 |
| block_publish_for_rest | 6 | 0 |

## 🔮 Surprising Connections

- **src_components_checklistpanel_js** → **src_components_checklistpanel_js_checklistpanel** (defines)
- **inc_namespace_php_set_up_checks** → **inc_namespace_php_should_block_publish** (calls)
- **inc_namespace_php_enqueue_assets** → **inc_namespace_php_should_block_publish** (calls)
- **inc_namespace_php_render_column** → **inc_namespace_php_get_check_status** (calls)
- **inc_namespace_php_render_column** → **inc_namespace_php_get_merged_meta** (calls)

## 🏘️ Communities

### Community 0 — should_block_publish (20 nodes, cohesion: 0.21)

- namespace
- block_publish_for_rest
- block_publish_if_failing
- bootstrap
- enqueue_assets
- get_check_status
- get_check_status_for_api
- get_combined_status
- get_merged_meta
- get_merged_terms
- get_post_terms
- stdClass
- WP_REST_Request
- is_publish_status
- register_column
- register_prepublish_check
- register_rest_fields
- render_column
- set_up_checks
- should_block_publish

### Community 1 — @wordpress/i18n/__ (19 nodes, cohesion: 0.11)

- ChecklistPanel
- ./ChecklistPanelContent/ChecklistPanelContent
- classnames/classNames
- ../itemStatus/COMPLETE
- ../itemStatus/INCOMPLETE
- lodash/forEach/forEach
- lodash/isEmpty/_isEmpty
- prop-types/PropTypes
- ../propTypes/itemsMapPropType
- @wordpress/components/PanelBody
- @wordpress/compose/compose
- @wordpress/data/withDispatch
- @wordpress/data/withSelect
- @wordpress/editor/PluginPrePublishPanel
- @wordpress/editor/PluginSidebar
- @wordpress/editor/PluginSidebarMoreMenuItem
- @wordpress/element/Component
- @wordpress/element/Fragment
- @wordpress/i18n/__

### Community 2 — ChecklistPanelContent() (15 nodes, cohesion: 0.13)

- ChecklistPanelContent
- ChecklistPanelContent()
- ./Checklist/Checklist
- ./CompletionIndicator/CompletionIndicator
- ./ConfirmOverrideHelpText/ConfirmOverrideHelpText
- prop-types/PropTypes
- ../propTypes/itemsCollectionPropType
- @wordpress/components/Button
- @wordpress/components/ToggleControl
- @wordpress/compose/compose
- @wordpress/data/withDispatch
- @wordpress/element/Fragment
- @wordpress/element/useEffect
- @wordpress/element/useState
- @wordpress/i18n/__

### Community 3 — ChecklistItem (8 nodes, cohesion: 0.25)

- ChecklistItem
- ChecklistItem
- .render()
- ./ChecklistItemContent/ChecklistItemContent
- prop-types/PropTypes
- ./StatusIcon/StatusIcon
- @wordpress/components/withFilters
- @wordpress/element/Component

### Community 4 — StatusIcon() (8 nodes, cohesion: 0.29)

- StatusIcon
- classnames/classNames
- ../itemStatus/COMPLETE
- ../itemStatus/INCOMPLETE
- ../itemStatus/INFO
- prop-types/PropTypes
- mapStatusToIcon()
- StatusIcon()

### Community 5 — CompletionIndicator() (7 nodes, cohesion: 0.29)

- CompletionIndicator
- CompletionIndicator()
- prop-types/PropTypes
- rc-progress/assets/index.css
- rc-progress/Line
- @wordpress/i18n/_n
- @wordpress/i18n/sprintf

### Community 6 — ConfirmOverrideHelpText() (7 nodes, cohesion: 0.29)

- ConfirmOverrideHelpText
- ConfirmOverrideHelpText()
- lodash/get
- @wordpress/compose/compose
- @wordpress/data/withSelect
- @wordpress/element/Fragment
- @wordpress/i18n/__

### Community 7 — PluginStatusIndicator() (7 nodes, cohesion: 0.29)

- PluginStatusIndicator
- ../icons/Check
- ../icons/Error
- @wordpress/data/dispatch
- @wordpress/data/useSelect
- @wordpress/element/useEffect
- PluginStatusIndicator()

### Community 8 — mapSelectToProps() (7 nodes, cohesion: 0.29)

- ChecklistPanel
- ../components/ChecklistPanel/ChecklistPanel
- lodash/get/_get
- @wordpress/compose/compose
- @wordpress/compose/withSafeTimeout
- @wordpress/data/withSelect
- mapSelectToProps()

### Community 9 — Status (6 nodes, cohesion: 0.33)

- class-status
- __construct
- get_data
- get_message
- get_status
- Status

### Community 10 — Checklist() (5 nodes, cohesion: 0.40)

- Checklist
- Checklist()
- ./ChecklistItem/ChecklistItem
- prop-types/PropTypes
- ../propTypes/itemsCollectionPropType

### Community 11 — ChecklistPanel (5 nodes, cohesion: 0.40)

- ChecklistPanel
- .componentDidMount()
- .componentDidUpdate()
- .getDerivedStateFromProps()
- .render()

### Community 12 — ChecklistItemContent() (4 nodes, cohesion: 0.50)

- ChecklistItemContent
- ChecklistItemContent()
- prop-types/PropTypes
- @wordpress/element/Fragment

### Community 13 — @wordpress/plugins/registerPlugin (4 nodes, cohesion: 0.50)

- index
- ./plugin
- ./style.scss
- @wordpress/plugins/registerPlugin

### Community 14 — Error() (3 nodes, cohesion: 0.67)

- index
- Check()
- Error()

### Community 15 — ./containers/PluginStatusIndicator/PluginStatusIndicator (3 nodes, cohesion: 0.67)

- plugin
- ./containers/ChecklistPanel/ChecklistPanel
- ./containers/PluginStatusIndicator/PluginStatusIndicator

### Community 16 — __DIR__ (2 nodes, cohesion: 1.00)

- plugin
- __DIR__

### Community 17 — prop-types/PropTypes (2 nodes, cohesion: 1.00)

- propTypes
- prop-types/PropTypes

### Community 18 — .eslintrc (1 nodes, cohesion: 1.00)

- .eslintrc

### Community 19 — itemStatus (1 nodes, cohesion: 1.00)

- itemStatus

## 🕳️ Knowledge Gaps

**Isolated nodes** (2):
- .eslintrc
- itemStatus

**Thin communities** (< 3 nodes): 4 communities

## 💰 Token Cost

| File | Tokens |
|------|--------|
| output | 0 |
| input | 0 |
| **Total** | **0** |

## ❓ Suggested Questions

1. Can you verify the inferred relationships of 'block_publish_if_failing' (degree 6)?
1. What role does '.eslintrc' play? It has no connections in the graph.
1. What role does 'itemStatus' play? It has no connections in the graph.
1. Why is 'ChecklistPanelContent()' (15 nodes) loosely connected (cohesion 0.13)? Should it be split?
1. Why is 'StatusIcon()' (8 nodes) loosely connected (cohesion 0.29)? Should it be split?
1. Why is 'ChecklistItem' (8 nodes) loosely connected (cohesion 0.25)? Should it be split?
1. Why is 'ConfirmOverrideHelpText()' (7 nodes) loosely connected (cohesion 0.29)? Should it be split?

---
_Generated by graphify-rs_
