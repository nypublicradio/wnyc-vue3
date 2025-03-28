<template>
  <div class="nypr-logos-bracket flex">
    <logo-nypr />
    <div class="bracket bracket-line" />

    <VFlexibleLink to="https://www.wnyc.org/100" target="_blank">
      <logo-wnyc />
    </VFlexibleLink>
    <VFlexibleLink to="http://gothamist.com/" target="_blank">
      <logo-gothamist />
    </VFlexibleLink>
    <!-- <VFlexibleLink to="https://www.wnycstudios.org/" target="_blank">
      <logo-wnyc-studios />
    </VFlexibleLink> -->
    <!-- <VFlexibleLink to="https://www.wnyc.org/series/new-jersey-public-radio/" target="_blank">
      <logo-njpr />
    </VFlexibleLink> -->
    <VFlexibleLink to="https://www.wqxr.org/" target="_blank" class="mt-1">
      <logo-wqxr />
    </VFlexibleLink>
    <!-- <VFlexibleLink to="https://www.newsounds.org/" target="_blank">
      <logo-new-sounds />
    </VFlexibleLink> -->
    <!-- <div class="inline-flex">
      <VFlexibleLink to="https://www.thegreenespace.org/" target="_blank">
        <logo-the-greene-space />
      </VFlexibleLink>
      <div class="bracket bracket-right ml-3" />
    </div> -->
  </div>
</template>

<style lang="scss">
.nypr-logos-bracket {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.25rem;

  @include media('<xl') {
    gap: 1rem 0.75rem;
  }

  @include media('<lg') {
    gap: 1rem 1rem;
  }

  @include media('<sm') {
    gap: 1rem 0.65rem;
  }

  svg {
    &.gothamist-logo {
      width: auto;
      height: 16px;
    }

    &.njpr-logo {
      width: auto;
      height: 18px;
    }

    path {
      transition: fill var(--p-transition-duration);
      -webkit-transition: fill var(--p-transition-duration);
      fill: var(--p-text-color);
    }
  }

  .bracket {
    height: 32px;
    width: 8px;
    border: 1px solid var(--p-text-color);

    &.bracket-line {
      width: 0;
      border-right: none;
      border-top: none;
      border-bottom: none;


    }

    &.bracket-left {
      border-right: none;

    }

    &.bracket-right {
      border-left: none;
    }
  }

  .flexible-link {
    &:hover {
      svg {
        path {
          fill: var(--p-primary-color) !important;
        }
      }
    }
  }
}
</style>
