<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <input :id="id" v-bind="inputProps" v-model="modelValue" />
  </div>
</template>

<script>
export default {
  name: "BaseInput",
  props: {
    modelValue: String,
    label: String,
    id: {
      type: String,
      default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: String,
    required: Boolean,
  },
  computed: {
    inputProps() {
      return {
        type: this.type,
        placeholder: this.placeholder,
        required: this.required,
      };
    },
  },
  emits: ["update:modelValue"],
};
</script>

<style scoped>
/* Estilos para inputs */
.form-group {
  margin-bottom: 1rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
</style>
