<template>
  <div>
    <div class="pipe-data">
      <div class="flex column-gap-1 row-gap-0 flex-wrap">
        <slot name="left" />
        <div class="flex column-gap-1">
          <div>|</div>
          <slot name="right" />
        </div>
      </div>
    </div>
  </div>
</template>
