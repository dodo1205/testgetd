<template>
    <div id="searchModal" tabindex="-1" aria-hidden="true" class="hidden overflow-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
        <div class="relative p-4 w-full max-w-2xl h-full md:max-h-screen overflow-hidden">
            <!-- Modal content -->
            <div class="relative bg-gray-800 rounded-lg shadow-lg overflow-y-auto h-full backdrop-blur-lg animate-fade-in">
                <!-- Modal header -->
                <div class="flex justify-between items-start p-4 rounded-t border-b border-gray-700">
                    <h3 class="w-full text-xl font-semibold text-white mr-4">
                        <form @submit.prevent="getLists" class="w-full">
                            <label for="searchModalInput" class="sr-only">Search Trakt lists</label>
                            <div class="relative">
                                <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <input v-model="state.searchQuery" type="search" id="searchModalInput" class="block p-4 pl-10 w-full text-sm bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-white" placeholder="Search Trakt lists" required>
                                <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-300">Search</button>
                            </div>
                        </form>
                    </h3>
                    <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-600 hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" @click="state.modal.toggle">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-6 space-y-6">
                    <div class="flex flex-col w-full gap-3 z-10">
                        <div v-for="item in state.searchResults" :key="item.id" class="p-6 bg-gray-700 rounded-lg border border-gray-600 shadow-md transform transition-transform duration-200 hover:scale-102 hover:border-blue-500">
                            <a href="#">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">
                                    {{item.name}} <small class="text-gray-400">by {{item.user}}</small>
                                    <span class="bg-blue-900 text-blue-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-3">{{item.likes}} likes</span>
                                    <span class="bg-blue-900 text-blue-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-3">Items count: {{item.item_count}}</span>
                                </h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-300">{{item.description}}</p>
                            <button @click="$emit('addList', item)" class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors duration-300">
                                Add list
                                <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { reactive } from 'vue';

const props = defineProps({
    searchQuery: String
});
const emits = defineEmits([
    'addList'
]);
const state = reactive({
    searchResults: [],
    modal: null,
    searchQuery: props.searchQuery,
});
</script>

<style scoped>
/* Fade in animation */
@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Apply animations */
.animate-fade-in {
    animation: fade-in 0.5s ease-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #2d3748;
}

::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 16px;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #718096;
}
</style>