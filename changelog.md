# Changelog

## Version 1.2.0

### Optimized
- **Consolidated Blur Logic**: Simplified blur logic for chats and messages to ensure consistent application during visibility changes.
- **Redundant Operations**: Reduced unnecessary re-application of the blur effect by checking if the effect is already applied.

### Improved
- **Performance**: Enhanced MutationObserver to better handle DOM updates in chat lists and message containers.
- **Reliability**: Ensured the script consistently adapts to dynamic changes in the DOM, improving overall stability.
