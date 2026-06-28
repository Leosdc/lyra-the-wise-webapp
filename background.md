# Antecedentes (Backgrounds) - Vampiro: A Máscara (V20)

Esta tabela contém a lista oficial dos **14 Antecedentes principais** do sistema V20, traduzidos para o português e com as explicações de lógica necessárias para o desenvolvimento do seu aplicativo.

| Antecedente (PT-BR) | Nome Original (EN) | O que representa no sistema / Lógica do App |
| :--- | :--- | :--- |
| **Aliados** | *Allies* | Confederações de mortais (amigos, família) que ajudam o personagem de boa vontade. |
| **Identidade Alternativa** | *Alternate Identity* | Uma identidade falsa estabelecida no mundo mortal, completa com documentação oficial. |
| **Mão Negra** | *Black Hand Membership* | (Exclusivo Sabbat) O número de membros da Mão Negra que o personagem pode convocar ou sua influência na seita. |
| **Contatos** | *Contacts* | Fontes de informação, informantes e "olhos nas ruas" que o personagem possui. |
| **Domínio** | *Domain* | Áreas de caça, alimentação e residência reconhecidas e respeitadas pela sociedade vampírica local. |
| **Fama** | *Fame* | Quão conhecido, célebre e reconhecido o personagem é no mundo dos mortais (celebridades, políticos). |
| **Geração** | *Generation* | Define a pureza do sangue e o tamanho do **combustível máximo (Blood Pool)** do vampiro. |
| **Rebanho** | *Herd* | Mortais aos quais o vampiro tem acesso livre, seguro e regular para se alimentar sem causar alarde. |
| **Influência** | *Influence* | O poder político, burocrático ou social que o personagem exerce ativamente dentro da sociedade mortal. |
| **Mentor** | *Mentor* | Um vampiro mais velho e experiente que aconselha, protege e apoia o personagem na sociedade cainita. |
| **Recursos** | *Resources* | Dinheiro líquido, investimentos, bens, propriedades e a renda mensal estável do personagem. |
| **Aliados de Sangue (Lacaios)** | *Retainers* | Seguidores totalmente leais, guarda-costas ou servos (geralmente carniçais/ghouls sob o laço de sangue). |
| **Rituais** | *Rituals* | (Exclusivo Sabbat) Quantos rituais místicos (*ritae*) o Cainita conhece, sabe guiar e executar. |
| **Status** | *Status* | A posição social, reputação, respeito e prestígio do personagem na sociedade dos vampiros de sua seita. |

---

### 💻 Regras de Implementação para o Código do App:

1. **Estado Inicial:** Todos os antecedentes começam com o valor zerado (`value = 0`).
2. **Pool de Pontos da Tela:** O usuário recebe **5 pontos** para distribuir livremente nesta seção durante a criação básica.
3. **Trava de Segurança (Limite de 3 bolinhas):** Impeça que o usuário coloque mais de 3 pontos em qualquer antecedente nesta tela de criação