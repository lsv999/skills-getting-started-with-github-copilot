/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, getByText, getByLabelText, screen } from "@testing-library/dom";

// Supondo que o HTML principal já está carregado em index.html
// e que fetchActivities e outros métodos estão em app.js

beforeEach(() => {
  // Configura um DOM básico para os testes
  document.body.innerHTML = `
    <div id="message"></div>
    <form id="signup-form">
      <input id="email" />
      <select id="activity"></select>
      <button type="submit">Inscrever</button>
    </form>
    <div id="activities-list"></div>
  `;
  // Mock global fetch
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("exibe atividades ordenadas no dropdown", async () => {
  const activities = {
    "Zumba": { description: "", schedule: "", max_participants: 10, participants: [] },
    "Chess Club": { description: "", schedule: "", max_participants: 10, participants: [] },
    "Art": { description: "", schedule: "", max_participants: 10, participants: [] }
  };
  fetch.mockResolvedValueOnce({
    json: async () => activities,
    ok: true,
  });

  // Importa e executa a função fetchActivities
  const { fetchActivities } = await import("./app.js");
  await fetchActivities();

  const options = Array.from(document.getElementById("activity").options).map(o => o.textContent);
  expect(options).toEqual([
    "Selecione uma atividade",
    "Art",
    "Chess Club",
    "Zumba"
  ]);
});

test("mostra mensagem de sucesso após inscrição", async () => {
  // Mock para atividades
  fetch
    .mockResolvedValueOnce({
      json: async () => ({
        "Chess Club": { description: "", schedule: "", max_participants: 10, participants: [] }
      }),
      ok: true,
    })
    // Mock para inscrição
    .mockResolvedValueOnce({
      json: async () => ({ message: "Signed up test@example.com for Chess Club" }),
      ok: true,
    })
    // Mock para recarregar atividades
    .mockResolvedValueOnce({
      json: async () => ({
        "Chess Club": { description: "", schedule: "", max_participants: 10, participants: ["test@example.com"] }
      }),
      ok: true,
    });

  const { fetchActivities } = await import("./app.js");
  await fetchActivities();

  document.getElementById("email").value = "test@example.com";
  document.getElementById("activity").innerHTML += '<option value="Chess Club">Chess Club</option>';
  document.getElementById("activity").value = "Chess Club";

  // Simula envio do formulário
  const signupForm = document.getElementById("signup-form");
  fireEvent.submit(signupForm);

  // Aguarda a mensagem aparecer
  await new Promise((r) => setTimeout(r, 100));

  expect(document.getElementById("message")).toHaveTextContent("Signed up test@example.com for Chess Club");
});