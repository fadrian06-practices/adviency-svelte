<script lang="ts">
  import api, { type Gift } from '$lib/api.svelte';
  import Snow from '$lib/Snow.svelte';

  const INITIAL_GIFT: Gift = {
    id: '',
    name: '',
    owner: '',
    imageUrl: '',
    quantity: undefined,
    price: undefined,
  };

  let gifts = $state<Gift[]>([]);
  let draft = $state({ ...INITIAL_GIFT });
  let dialog = document.createElement('dialog');
  let loading = $state(false);
  let list = document.createElement('dialog');
  let playing = $state(false);
  let audio = document.createElement('audio');

  const total = $derived.by(() =>
    gifts.reduce(
      (total, gift) => total + (gift.price || 0) * (gift.quantity || 0),
      0,
    ),
  );

  function handleSubmit() {
    if (gifts.includes(draft)) return;

    if (draft.id) {
      const index = gifts.findIndex((gift) => gift.id === draft.id);

      gifts[index] = { ...gifts[index], ...draft };
    } else {
      gifts.push({ ...draft, id: crypto.randomUUID() });
      alert('here');
    }

    draft = { ...INITIAL_GIFT };
  }

  function handleEdit(gift: Gift) {
    draft = gift;
    dialog.showModal();
  }

  function handleDuplicate(gift: Gift) {
    draft = { ...gift, id: '', owner: '', quantity: undefined };
    dialog.showModal();
  }

  function setRandomName() {
    const names = ['Medias', 'PC', 'Trabajo'];
    let randomName = names[Math.floor(Math.random() * names.length)];

    if (randomName === draft.name) {
      setRandomName();
    } else {
      draft.name = randomName;
    }
  }

  function formatPrice(price: number) {
    return price.toLocaleString('es-VE', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    });
  }

  $effect(() => {
    loading = true;

    api.gifts.list().then((apiGifts) => {
      gifts = apiGifts;
      loading = false;
    });
  });

  $effect(() => {
    api.gifts.save(gifts);
  });

  $effect(() => {
    playing ? audio.play() : audio.pause();
  });
</script>

<Snow />

{#if playing}
  <button
    class="secondary absolute top-1 left-1"
    onclick={() => (playing = false)}
  >
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <title>Pausar</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
      />
    </svg>
  </button>
{:else}
  <button
    class="secondary absolute top-1 left-1"
    onclick={() => (playing = true)}
  >
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <title>Reproducir</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
      />
    </svg>
  </button>
{/if}

<audio
  bind:this={audio}
  src="https://cdn.pixabay.com/download/audio/2024/11/30/audio_706ce61de1.mp3?filename=christmas-holidays-270797.mp3"
  loop
  class="absolute top-1 left-1 hidden"
  volume={0.5}
></audio>

<dialog bind:this={dialog} class="rounded-md p-4 min-w-[320px]">
  <form
    method="dialog"
    onsubmit={handleSubmit}
    class="grid items-center gap-2 min-h-[320px]"
  >
    <div class="flex gap-2">
      <input placeholder="Nombre" bind:value={draft.name} required />
      <button type="button" onclick={setRandomName}> ¡Ayúdame! </button>
    </div>
    <input placeholder="Destinatario" bind:value={draft.owner} required />
    <input
      type="url"
      placeholder="URL de la imagen"
      bind:value={draft.imageUrl}
    />
    <input
      placeholder="Precio"
      bind:value={draft.price}
      type="number"
      required
      min={1}
    />
    <input
      placeholder="Cantidad"
      bind:value={draft.quantity}
      type="number"
      required
      min={1}
    />
    <button class="primary">
      {draft.id ? 'Editar' : 'Agregar'}
    </button>
    <button type="button" class="secondary" onclick={() => dialog.close()}>
      Cerrar
    </button>
  </form>
</dialog>

<dialog bind:this={list} class="rounded-md p-4 min-w-[320px]">
  <div class="flex flex-col gap-2">
    <div class="relative overflow-x-auto">
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th class="px-6 py-3"> Regalo </th>
            <th class="px-6 py-3"> Cantidad </th>
          </tr>
        </thead>
        <tbody>
          {#each gifts as gift}
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                {gift.name}
              </th>
              <td class="px-6 py-4">{gift.quantity}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <button onclick={() => print()} class="secondary print:hidden">
      Imprimir
    </button>
  </div>
</dialog>

{#if loading}
  <div class="flex items-center justify-center min-h-screen">
    <svg
      class="w-8 h-8 text-white animate-spin dark:text-gray-600 fill-pink-500"
      viewBox="0 0 100 101"
      fill="none"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  </div>
{:else}
  <main class="bg-white p-4 rounded-md grid gap-4 min-w-[320px] print:hidden">
    <h1 class="font-christmas text-4xl">Regalos</h1>

    <button class="primary" onclick={() => dialog.showModal()}>
      Agregar regalo
    </button>

    {#if gifts.length}
      <button class="secondary" onclick={() => list.showModal()}>
        Previsualizar
      </button>

      <ul>
        {#each gifts as gift, index}
          <li class="flex items-center gap-2">
            {#if gift.imageUrl}
              <img
                class="aspect-square w-8 h-8 rounded"
                src={gift.imageUrl}
                alt={gift.name}
              />
            {/if}
            <div class="flex-1">
              <p>
                {gift.name} x {gift.quantity} = {formatPrice(
                  (gift.price || 0) * (gift.quantity || 0),
                )}
              </p>
              <p class="opacity-70 text-xs">{gift.owner}</p>
            </div>
            <div>
              <button onclick={() => handleEdit(gift)}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <title>Editar</title>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
              <button onclick={() => handleDuplicate(gift)}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <title>Duplicar</title>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
              </button>

              <button onclick={() => gifts.splice(index, 1)}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <title>Borrar</title>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </li>
        {/each}
      </ul>

      <p class="text-center py-2 border-t">
        Total: {formatPrice(total)}
      </p>
    {:else}
      <p class="text-center opacity-50 py-4">No hay regalos</p>
    {/if}

    <button class="danger" onclick={() => (gifts = [])}>Borrar todo</button>
  </main>
{/if}
