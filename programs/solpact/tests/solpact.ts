import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Solpact } from "../target/types/solpact";
import { expect } from "chai";

describe("solpact", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Solpact as Program<Solpact>;
    const provider = anchor.getProvider();
    const authority = provider.wallet;

    it("Is initialized!", async () => {
        // Add trial tests here
    });
});
