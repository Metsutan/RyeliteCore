export interface PluginConfig {
    repository_owner: string;
    repository_name: string;
    asset_sha: string; // sha256 hex string of the asset content
    display_name?: string;
    display_author?: string;
    display_description?: string;
}
