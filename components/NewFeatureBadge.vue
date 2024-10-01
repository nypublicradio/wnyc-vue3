<template>
  <div class="new-feature-badge">NEW</div>
</template>

<style lang="scss" scoped>
.new-feature-badge {
  pointer-events: none;
  background-color: var(--yellow);
  color: var(--black-500);
  padding: 0.15rem 0.3rem;
  border-radius: 0.15rem;
  font-size: 0.7rem;
  font-weight: bold;
  &:before {
    content: "";
    position: absolute;
    top: 36px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform: rotate(-90deg);
    border-top: 0.25rem solid transparent;
    border-bottom: 0.25rem solid transparent;
    border-right: 0.5rem solid var(--yellow);
  }
}
</style>
