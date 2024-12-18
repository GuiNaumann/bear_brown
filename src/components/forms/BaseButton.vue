<template>
  <button :type="type" class="base-button">
    <slot />
  </button>
</template>

<script>
export default {
  name: "BaseButton",
  props: {
    type: {
      type: String,
      default: "button",
    },
  },
};
</script>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
.base-button:hover {
  background-color: #0056b3;
}
</style>
